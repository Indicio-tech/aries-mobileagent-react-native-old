import { v4 as uuidv4 } from 'uuid'
import { String } from 'runtypes'
import { decodeBase64, encodeBase64 } from '../../../utils/index'

//Storage Dependencies
import StorageService from '../../../storage/nonSecrets/'

//DID Service
import DIDService from '../dids/didService'
import MediationService from '../mediation/mediationService'

import ConnectionsHandler from '../../protocols/connections/connections'
import TrustPingHandler from '../../protocols/trustPing/trustPing'


import ConnectionsServiceInterface, { ConnectionsAdminAPIInterface, InvitationRecord, Service, InvitationUses, InvitationID, Connection, ConnectionID, ConnectionRoles, ConnectionStates } from './connectionsServiceInterface'

import { Invitation } from '../../protocols/connections/messages'
import { URLType } from '../../../utils/types'
import { DIDDoc } from '../dids/didServiceInterface'
import { StorageRecord } from '../../../storage'
import { MediatorRecord } from '../mediation/mediationServiceInterface'

class ConnectionsService implements ConnectionsServiceInterface {
    adminAPI:ConnectionsAdminAPIInterface

    constructor(
    ){
        console.info("Connections Service created")

        this.adminAPI = new ConnectionsAdminAPI(this)
    }

    
    async generateInvitation():Promise<Invitation> {
        throw new Error("generateInvitation() notImplemented")
    }

    async receiveInvitation(invitationURL:string, role:ConnectionRoles):Promise<InvitationRecord> {
        console.info("Received new invitation", invitationURL)
        
        //Process invitation
        const invitation:Invitation = await this._processInvitation(invitationURL)

        var invitationService:Service;

        if(Invitation.guard(invitation)){
            invitationService = await ConnectionsHandler.processInvitation(invitation)
        }
        else{
            throw new Error("Unidentified Invitation")
        }
        
        //Create Invitation Record
        const invitationRecord:InvitationRecord = {
            invitationID: uuidv4(),
            origin: "external",
            role: role,
            label: invitation.label,
            service: invitationService,
            invitation: invitation,
            rawInvitation: invitationURL,
            uses: 1,
        }
        
        //Store Invitation Record
        await this._addInvitationRecord(invitationRecord)

        return invitationRecord
    }

    async _processInvitation(invitationURL:string):Promise<Invitation> {
        //JamesKEbert TODO: Validate Invitation String
        const [invitationEndpoint, invitationString] = invitationURL.split('?c_i=')

        const invitation = decodeBase64(invitationString)
        const parsedInvitation = JSON.parse(invitation)

        console.info("Processed Invitation", parsedInvitation)

        return parsedInvitation
    }

    async _addInvitationRecord(invitationRecord:InvitationRecord):Promise<void> {
        console.info("Adding Invitation Record", invitationRecord)

        //Validate invitation record to be stored
        InvitationRecord.check(invitationRecord)

        let tags = {}
        if(invitationRecord.origin === "local"){
            tags = {
                ...tags,
                recipientKey: invitationRecord.service.recipientKeys[0]
            }
        }

        const recordToStore = {
            type: "invitation",
            id: invitationRecord.invitationID,
            content: invitationRecord,
            tags: tags
        }

        await StorageService.storeRecord(recordToStore)
    }

    async getInvitationRecord(invitationID:InvitationID):Promise<InvitationRecord> {
        let invitation:any = await StorageService.retrieveRecord(
            "invitation",
            invitationID,
            {
                retrieveType: true,
                retrieveValue: true,
                retrieveTags: true
            }
        )

        return invitation.content
    }

    async searchInvitationRecords():Promise<Array<InvitationRecord>> {
        throw new Error("SearchInvitationRecords() not implemented")
        await StorageService.searchRecords(
            "invitation",
            {
                recipientKey: {$in: ["345","456"]}
            },
            {
                retrieveRecords: true,
                retrieveTotalCount: false,
                retrieveType: false,
                retrieveValue: true,
                retrieveTags: true
            },
            100
        )
    }

    async acceptInvitation(
        invitationID:InvitationID, 
        label:string = "AMA-RN Agent",
        mediatorID:string|null = null,
    ):Promise<ConnectionID> {
        console.info(`Accepting Invitation ${invitationID}`)

        const invitation:InvitationRecord = await this.getInvitationRecord(invitationID)
        
        if(invitation.origin === "local"){
            throw new Error("Cannot accept the agent's own invitation")
        }

        //Update Invitation Record
        //TODO

        let routingKeys:string[] = []
        let endpoint:string = ""

        //Identify if the connection needs to be mediated, if so fetch endpoint and routing keys
        if(invitation.role === "peer"){
            if(!mediatorID){
                throw new Error(`Connection Role "peer" requires a mediatorID so connections can be mediated`)
            }
            
            const mediatorRecord:MediatorRecord = await MediationService.getMediatorRecord(mediatorID)
            routingKeys = mediatorRecord.routingKeys
            endpoint = mediatorRecord.endpoint
        }

        //Create DID and DIDDoc
        const didKeyPair = await DIDService.createNewDID()
        const didDOC = await DIDService.createDIDDoc(didKeyPair, endpoint, routingKeys)

        let internalService:Service = {
            recipientKeys: [didKeyPair.key],
            routingKeys: routingKeys,
            serviceEndpoint: endpoint,
        }

        //Add Connection
        const connection:Connection = await this._addConnectionRecord({
            connectionID: uuidv4(),
            role: invitation.role,
            state: "invite-received",
            agentDIDKeyPair: didKeyPair,
            internalService: internalService,
            agentDIDDoc: didDOC,
            externalDIDDoc: null,
            externalService: invitation.service,
            invitationID: invitationID,
            label: label,
            externalLabel: invitation.label,
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            mediatorID: mediatorID,
        })

        //Add keys to be mediated if required and then send request. 
        if(invitation.role === "peer"){
            if(!mediatorID){
                throw new Error("Mediator ID not defined")
            }
            await MediationService.sendKeylistUpdate(mediatorID, [{
                recipient_key: connection.agentDIDKeyPair.key,
                action: "add"
            }])
        }
        //Send request immediately if no mediation is required
        //If connecting to a mediator, add a return route
        else if(invitation.role === "mediation-recipient"){
            await this.sendRequest(connection, true)
        }
        else{
            await this.sendRequest(connection, false)
        }

        return connection.connectionID
    }

    async connectionMediated(connection:Connection):Promise<void> {
        console.info(`Connection ${connection.connectionID} now mediated`)

        //Determine the next action based off of current state
        if(connection.state === "invite-received"){
            await this.sendRequest(connection, false)
        }
        else if(connection.state === "request-received"){

        }
        else{
            throw new Error(`Unable to proceed after connection mediated with state ${connection.state}`)
        }
    }

    async sendRequest(connection:Connection, returnRoute:boolean = false):Promise<void> {
        await ConnectionsHandler.sendRequest(
            connection.label, 
            connection.agentDIDDoc, 
            connection.externalService.serviceEndpoint,
            connection.externalService.recipientKeys,
            connection.internalService.recipientKeys[0],
            connection.externalService.routingKeys,
            returnRoute
        )

        await this.updateConnectionRecord(connection.connectionID, {
            state: "request-sent"
        })
    }

    async receiveResponse(didDoc:DIDDoc, connection:Connection):Promise<void> {
        console.info(`Received Connection Response for connection ${connection.connectionID}`)

        //Retrieve the service to contact the agent by
        const didDocService = await DIDService.retrieveDIDDocService(didDoc)
        const externalService:Service = {
            recipientKeys: didDocService.recipientKeys,
            serviceEndpoint: didDocService.serviceEndpoint,
            routingKeys: []
        }
        if(didDocService.routingKeys){
            externalService.routingKeys = didDocService.routingKeys
        }

        const updatedConnection:Connection = await this.updateConnectionRecord(connection.connectionID, {
            state: "response-received",
            externalDIDDoc: didDoc,
            externalService: externalService
        })

        //Send follow-up message as determined by invitation or role
        if(updatedConnection.role === "mediation-recipient"){
            await MediationService.requestMediation(updatedConnection)
        }
        else{
            await TrustPingHandler.sendTrustPing(updatedConnection.connectionID)
        }

        await this.updateConnectionRecord(updatedConnection.connectionID, {
            state: "active",
        })
    }

    async _addConnectionRecord(connection:Connection):Promise<Connection> {
        console.info("Adding Connection Record", connection)

        //Validate connection record to be stored
        Connection.check(connection)

        let tags = {
            recipientKey: connection.agentDIDKeyPair.key
        }

        const recordToStore = {
            type: "connection",
            id: connection.connectionID,
            content: connection,
            tags: tags
        }

        await StorageService.storeRecord(recordToStore)

        await this._broadcastConnectionRecord(connection)

        return connection
    }

    async updateConnectionRecord(
        connectionID:ConnectionID,
        connectionUpdates:{} = {}
    ):Promise<Connection> {
        const currentConnection = await this.getConnectionRecord(connectionID)
        
        let connection:Connection = Object.assign(currentConnection, connectionUpdates)
        connection.updatedAt = Date.now().toString()

        await StorageService.updateRecord(
            "connection",
            connectionID,
            connection
        )

        await this._broadcastConnectionRecord(connection)

        return connection
    }

    async getConnectionRecord(connectionID:ConnectionID):Promise<Connection> {
        let connection:any = await StorageService.retrieveRecord(
            "connection",
            connectionID,
            {
                retrieveType: true,
                retrieveValue: true,
                retrieveTags: true
            }
        )

        return connection.content
    }

    async searchConnectionRecords(recipientKeys:string[] = []):Promise<StorageRecord[]> {
        const connectionRecords = await StorageService.searchRecords(
            "connection",
            {
                recipientKey: {$in: recipientKeys}
            },
            {
                retrieveRecords: true,
                retrieveTotalCount: false,
                retrieveType: false,
                retrieveValue: true,
                retrieveTags: true
            },
            100
        )

        return connectionRecords
    }

    async _broadcastConnectionRecord(connection:Connection):Promise<void> {
        console.info(`Connection Record Update for Connection ${connection.connectionID}`, connection)

    }
}

class ConnectionsAdminAPI implements ConnectionsAdminAPIInterface {
    service:ConnectionsServiceInterface

    constructor(service:ConnectionsServiceInterface){
        this.service = service
    }

    async receiveInvitation(invitationURL:string, role:ConnectionRoles):Promise<InvitationRecord> {
        return await this.service.receiveInvitation(invitationURL, role)
    }

    async acceptInvitation(
        invitationID:InvitationID, 
        label:string,
        mediatorID:string|null,
    ):Promise<ConnectionID> {
        return await this.service.acceptInvitation(invitationID, label, mediatorID)
    }
}

export default new ConnectionsService()