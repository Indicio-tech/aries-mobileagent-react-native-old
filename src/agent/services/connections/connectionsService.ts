import { v4 as uuidv4 } from 'uuid'
import { decodeBase64, encodeBase64 } from '../../../utils/index'

//Storage Dependencies
import StorageServiceInterface from '../../../storage'

//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

//DID Service
import DIDService from '../dids/didService'

import ConnectionsHandlerInterface from '../../protocols/connections/connectionsInterface'

import ConnectionsServiceInterface, { WalletName, WalletPassword, InvitationRecord, InternalService, InvitationUses, InvitationID, Connection, ConnectionID, ConnectionRoles, ConnectionStates } from './connectionsServiceInterface'

import { Invitation } from '../../protocols/connections/messages'

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

    async receiveInvitation(invitationURL:string, role:ConnectionRoles, autoConnect:boolean):Promise<InvitationRecord> {
        console.info("Received new invitation", invitationURL)
        
        //Process invitation
        const invitation:Invitation = await this._processInvitation(invitationURL)

        var invitationService:InternalService;

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
            autoConnect: autoConnect,
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

        return invitation
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

    async createConnectionByInvitationID(invitationID:InvitationID):Promise<Connection> {
        console.info(`Creating Connection by InvitationID ${invitationID}`)

        const invitation:InvitationRecord = await this.getInvitationRecord(invitationID)

        const connection:Connection = {
            connectionID: uuidv4(),
            role: invitation.role,
            state: "initiated",
            agentVerkey: String,
            agentDIDDoc: DIDDoc.Or(Null),
            externalService: InternalService,
            externalDIDDoc: DIDDoc.Or(Null),
            invitationID: invitationID,
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            mediation: ,
        }

    }

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

