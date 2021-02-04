import { v4 as uuidv4 } from 'uuid'
import { decodeBase64, encodeBase64 } from '../../../utils/index'

//Storage Dependencies
import StorageServiceInterface from '../../../storage'

//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

//DID Service
import DIDService from '../dids/didService'

import ConnectionsHandlerInterface from '../../protocols/connections/connectionsInterface'

import ConnectionsServiceInterface, { WalletName, WalletPassword, InvitationRecord, Service, InvitationUses, InvitationID, Connection, ConnectionID, ConnectionRoles, ConnectionStates } from './connectionsServiceInterface'

import { Invitation } from '../../protocols/connections/messages'
import { URLType } from '../../../utils/types'
import { MediatorID } from '../mediation/mediatorServiceInterface'
import { DIDDoc } from '../dids/didServiceInterface'

export default class ConnectionsService implements ConnectionsServiceInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    #DIDService:DIDService
    
    #connectionsHandler!:ConnectionsHandlerInterface

    #walletName:WalletName
    #walletPassword:WalletPassword


    constructor(
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface,
        walletName:WalletName,
        walletPassword:WalletPassword,
        DIDService:DIDService
    ){
        console.info("Connections Service created")

        this.#walletService = walletService
        this.#walletName = walletName
        this.#walletPassword = walletPassword
        this.#storageService = storageService
        this.#DIDService = DIDService
    }

    registerProtocolHandlers(connections:any):void {
        this.#connectionsHandler = connections
        console.info("Protocols Registered in Connections Service")
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
            invitationService = await this.#connectionsHandler.processInvitation(invitation)
        }
        else{
            throw new Error("Unidentified Invitation")
        }
        
        //Create Invitation Record
        const invitationRecord:InvitationRecord = {
            invitationID: uuidv4(),
            origin: "external",
            role: role,
            service: invitationService,
            invitation: invitation,
            rawInvitation: invitationURL,
            uses: 1,
        }
        
        //Store Invitation Record
        await this.storeInvitationRecord(invitationRecord)
        //console.log(await this.searchInvitationRecords())

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

    async storeInvitationRecord(invitationRecord:InvitationRecord):Promise<void> {
        console.info("Storing Invitation Record", invitationRecord)

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

        await this.#storageService.storeRecord(this.#walletName, this.#walletPassword, recordToStore)
    }

    async getInvitationRecord(invitationID:InvitationID):Promise<InvitationRecord> {
        let invitation:any = await this.#storageService.retrieveRecord(
            this.#walletName, 
            this.#walletPassword,
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
        await this.#storageService.searchRecords(
            this.#walletName,
            this.#walletPassword,
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

        //return 
    }

    // async updateInvitation():Promise<void> {}

    // async createConnectionRecord():Promise<ConnectionID> {}
    // async storeConnectionRecord():Promise<void> {}
    // async getConnectionRecord():Promise<Connection> {}
    // async updateConnection():Promise<void> {}
    // async deleteConnection():Promise<void> {
    //     throw new Error("deleteConnection() notImplemented")
    // }

    async acceptInvitation(
        invitationID:InvitationID, 
        label:string = "AMA-RN Agent",
        mediator:MediatorID|null = null,
    ):Promise<ConnectionID> {
        console.info(`Accepting Invitation ${invitationID}`)

        const invitation:InvitationRecord = await this.getInvitationRecord(invitationID)
        
        if(invitation.origin === "local"){
            throw new Error("Cannot accept the agent's own invitation")
        }

        const routingKeys:string[] = []
        const serviceEndpoint = ""
        if(mediator){
            //Get mediator routing keys and service endpoint
        }

        const connection:Connection = await this.createConnectionRecord(
            invitation.role,
            "invite-received",
            serviceEndpoint,
            routingKeys,
            null,
            invitation.service,
            invitationID,
            mediator
        )

        let returnRoute = false
        if(invitation.role === "mediation-recipient"){
            returnRoute = true
        }

        await this.sendRequest(connection, label, returnRoute)

        return connection.connectionID
    }

    async sendRequest(connection:Connection, label:string, returnRoute:boolean = false):Promise<void> {
        await this.#connectionsHandler.sendRequest(
            label, 
            connection.agentDIDDoc, 
            connection.externalService.serviceEndpoint,
            connection.externalService.recipientKeys,
            connection.internalService.recipientKeys[0],
            connection.externalService.routingKeys,
            returnRoute
        )
    }


    async createConnectionRecord(
        role: ConnectionRoles,
        state: "request-received" | "invite-received",
        serviceEndpoint:URLType = "", 
        routingKeys:string[] = [],
        externalDIDDoc:DIDDoc|null,
        externalService:Service,
        invitationID:InvitationID,
        mediator:MediatorID|null,
    ):Promise<Connection> {
        const didKeyPair = await this.#DIDService.createNewDID()
        const didDOC = await this.#DIDService.createDIDDoc(didKeyPair, serviceEndpoint, routingKeys)
        
        const connection:Connection = {
            connectionID: uuidv4(),
            role: role,
            state: state,
            agentDIDKeyPair: didKeyPair,
            internalService: {
                recipientKeys: [didKeyPair.key],
                routingKeys: routingKeys,
                serviceEndpoint: serviceEndpoint
            },
            agentDIDDoc: didDOC,
            externalDIDDoc: externalDIDDoc,
            externalService: externalService,
            invitationID: invitationID,
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            mediation: {
                mediator: mediator,
                state: "not-mediated"
            },
        }

        await this.storeConnection(connection)

        return connection
    }

    async broadcastConnectionRecord(connection:Connection):Promise<void> {
        console.info(`Connection Record Update for Connection ${connection.connectionID}`, connection)

    }

    async storeConnection(connection:Connection):Promise<void> {
        console.info("Storing Connection Record", connection)

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

        await this.#storageService.storeRecord(this.#walletName, this.#walletPassword, recordToStore)

        await this.broadcastConnectionRecord(connection)
    }

    // async createConnectionByInvitationID(invitationID:InvitationID):Promise<Connection> {
    //     console.info(`Creating Connection by InvitationID ${invitationID}`)

    //     const invitation:InvitationRecord = await this.getInvitationRecord(invitationID)

    //     const didKeyPair = await this.#DIDService.createNewDID()
    //     //const didDOC = await this.#DIDService.createDIDDoc(didKeyPair, "", [])

    //     const connection:Connection = {
    //         connectionID: uuidv4(),
    //         role: invitation.role,
    //         state: "created",
    //         agentDIDKeyPair: didKeyPair,
    //         internalService: {
    //             recipientKeys: [didKeyPair.key],
    //             routingKeys: [],
    //             serviceEndpoint: ""
    //         },
    //         agentDIDDoc: null,
    //         externalDIDDoc: null,
    //         externalService: invitation.service,
    //         invitationID: invitationID,
    //         createdAt: Date.now().toString(),
    //         updatedAt: Date.now().toString(),
    //         mediation: {
    //             mediator: null,
    //             state: "not-mediated"
    //         },
    //     }

    // }

    // async connectionMediated(
    //     connectionID:ConnectionID, 
    //     mediatorConnectionID:ConnectionID, 
    //     routingKeys:string[] = [], 
    //     serviceEndpoint:URLType
    // ):Promise<void> {
    //     const didDOC = await this.#DIDService.createDIDDoc(didKeyPair, "", [])

    //     const connection:Connection = {
    //         connectionID: ,
    //         role: ,
    //         state: ,
    //         agentDIDKeyPair:,
    //         internalService: {
    //             recipientKeys: [didKeyPair.key],
    //             routingKeys: routingKeys,
    //             serviceEndpoint: serviceEndpoint
    //         },
    //         agentDIDDoc: didDOC,
    //         externalDIDDoc: ,
    //         externalService: ,
    //         invitationID: ,
    //         createdAt: ,
    //         updatedAt: Date.now().toString(),
    //         mediation: {
    //             mediator: mediatorConnectionID,
    //             state: "mediated"
    //         },
    //     }

    //     //Determine next step, either requestConnection or sendResponse
    // }

    // async receiveResponse():Promise<void> {}
    
    // async receiveConnectionRequest():Promise<void> {}

    // async sendResponse():Promise<void> {}

    // async receiveAck():Promise<void> {}
    // async sendAck():Promise<void> {}

    

    // async receiveNewInvitation(invitationURL:string, role:ConnectionRoles):Promise<void> {
    //     console.info("Received New Invitation, creating new connection")

    //     const invitation:Invitation = await this.processInvitation(invitationURL)

    //     //Create new connection
    //     const connectionID = uuidv4()

    //     const connection:Connection = {
    //         connectionID: connectionID,
    //         role: role,
    //         state: "invitation-received",
    //         agentDIDDoc: null,
    //         foreignDIDDoc: null,
    //         invitation: invitation,
    //         rawInvitation: invitationURL,
    //         createdAt: Date.now().toString(),
    //         updatedAt: Date.now().toString(),
    //         mediation: MediationDetails.Or(Undefined),
    //     }

    //     //Store new connection
    //     await this.storeConnection(connection)
    // }

    // async processInvitation(invitationURL:string):Promise<Invitation> {
    //     return await this.#connectionsHandler.processInvitation(invitationURL)
    // }


    // async storeConnection(connection:Connection):Promise<void> {
    //     console.info("Storing Connection")
    // }

    // async connectionRecord(
    //     connection:Connection, 
    // ):Promise<Connection> {

    // }
}

