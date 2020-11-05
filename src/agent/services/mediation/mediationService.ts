import WS from '../../../transports/ws/ws'

import { URLType } from '../../../utils/types'


import ConnectionsService from '../connections/connectionsService'
import { Connection } from '../connections/connectionsServiceInterface'

//Storage Dependencies
import StorageService from '../../../storage/nonSecrets/'

import MediationServiceInterface, { MediationAdminAPIInterface, MediatorInvite, MediatorID, MediatorRecord, KeylistUpdate, KeylistUpdateResults } from './mediationServiceInterface'
import CoordinateMediationHandler from '../../protocols/coordinateMediation/coordinateMediation'
import TrustPingHandler from '../../protocols/trustPing/trustPing'
import { StorageRecord } from '../../../wallet'


class MediationService implements MediationServiceInterface {
    
    adminAPI:MediationAdminAPIInterface

    constructor(
    ){
        console.info("Mediation Service Created")

        this.adminAPI = new MediationAdminAPI(this)
        WS.webSocketCloseEvents.addListener("handler-closed", this._webSocketHandlerClosed.bind(this))
    }   

    async _webSocketHandlerClosed(endpoint:string):Promise<void> {
        const mediatorRecords:any = await this.searchMediatorRecords(endpoint)
        
        if(mediatorRecords[0]){
            const mediator:MediatorRecord = mediatorRecords[0].content
        
            //Validate mediator record
            MediatorRecord.check(mediator)

            console.warn(`Mediator ${mediator.mediatorID} WebSocket Handler closed, sending trust ping to re-open connection`)
    
            await TrustPingHandler.sendTrustPing(mediator.connectionID)
        }
    }

    async addMediator(invite:MediatorInvite, mediatorID:MediatorID):Promise<void> {
        console.info(`Adding New Mediator with ID: ${mediatorID}`)

        const invitation = await ConnectionsService.receiveInvitation(
            invite, 
            "mediation-recipient"
        )
        const connectionID = await ConnectionsService.acceptInvitation(
            invitation.invitationID,
            "AMA-RN Agent",
            mediatorID
        )

        //Create Mediator Record
        const mediatorRecord:MediatorRecord = {
            state: "connecting",
            connectionID: connectionID,
            mediatorID: mediatorID,
            endpoint: '',
            routingKeys: []
        }


        await this._addMediatorRecord(mediatorRecord)

        console.info(`Mediation Connection created with connection ID: ${connectionID}`)
    }

    async requestMediation(connection:Connection):Promise<void> {
        console.log(`Requesting Mediation from '${connection.mediatorID}'`)

        if(typeof connection.mediatorID !== 'string'){
            throw new Error("Mediatior recipient connection lacks a mediation ID")
        }
        await CoordinateMediationHandler.sendMediationRequest(connection.connectionID)

        await this.updateMediationRecord(connection.mediatorID, {
            state: "requested-mediation"
        })
        await StorageService.addTagsToRecord(
            "mediator",
            connection.mediatorID,
            {
                "endpoint": connection.externalService.serviceEndpoint
            }
        )
    }

    async mediationGranted(connection:Connection, endpoint:URLType, routingKeys:string[]):Promise<void> {
        if(typeof connection.mediatorID !== 'string'){
            throw new Error("Mediatior recipient connection lacks a mediation ID")
        }
        
        await this.updateMediationRecord(connection.mediatorID, {
            state: "mediation-granted",
            endpoint: endpoint,
            routingKeys: routingKeys
        })
    }

    async sendKeylistUpdate(mediatorID:MediatorID, keylistUpdates:KeylistUpdate[] = []):Promise<void> {
        console.info(`Sending keylist update to mediator ${mediatorID}`, keylistUpdates)

        const mediatorRecord = await this.getMediatorRecord(mediatorID)
        
        await CoordinateMediationHandler.sendKeylistUpdate(mediatorRecord.connectionID, keylistUpdates)
    }

    async receiveKeylistUpdateResponse(mediatorID:MediatorID, keylistUpdatesResults:KeylistUpdateResults[] = []):Promise<void> {
        console.info(`Received Keylist Update Response from mediator ${mediatorID}`)

        for(var i = 0; i < keylistUpdatesResults.length; i++){
            if(keylistUpdatesResults[i].result === "client_error" || keylistUpdatesResults[i].result === "server_error"){
                throw new Error("Error updating mediator keylist")
            }
            else if(keylistUpdatesResults[i].result === "success"){
                //Find connections to continue to move to next step
                const connectionsRecords = await ConnectionsService.searchConnectionRecords([keylistUpdatesResults[i].recipient_key])
                const connection:any = connectionsRecords[0].content

                await ConnectionsService.connectionMediated(connection)
            }
            else if(keylistUpdatesResults[i].result === "no_change"){
                console.warn(`No change in keylist value`)
            }
            else{
                console.warn(`Unrecognized Keylist update response result ${keylistUpdatesResults[i].result}`)
            }
        }
    }

    async _addMediatorRecord(mediatorRecord:MediatorRecord, tags:{} = {}):Promise<void> {
        console.info("Storing Mediation Record", MediatorRecord)

        //Validate mediation record to be stored
        MediatorRecord.check(mediatorRecord)


        const recordToStore = {
            type: "mediator",
            id: mediatorRecord.mediatorID,
            content: mediatorRecord,
            tags: tags
        }

        await StorageService.storeRecord(recordToStore)

        await this._broadcastMediationRecord(mediatorRecord)
    }

    async getMediatorRecord(mediatorID:MediatorID):Promise<MediatorRecord> {
        let mediator:any = await StorageService.retrieveRecord(
            "mediator",
            mediatorID,
            {
                retrieveType: true,
                retrieveValue: true,
                retrieveTags: true
            }
        )

        return mediator.content
    }

    async searchMediatorRecords(endpoint:string):Promise<StorageRecord[]> {
        const mediatorRecords:any = await StorageService.searchRecords(
            "mediator",
            {
                endpoint: endpoint
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

        return mediatorRecords
    }

    async updateMediationRecord(
        mediatorID:MediatorID,
        mediatorUpdates:{} = {}
    ):Promise<MediatorRecord> {
        const currentMediatorRecord = await this.getMediatorRecord(mediatorID)
        
        let mediatorRecord:MediatorRecord = Object.assign(currentMediatorRecord, mediatorUpdates)

        await StorageService.updateRecord(
            "mediator",
            mediatorID,
            mediatorRecord
        )

        await this._broadcastMediationRecord(mediatorRecord)

        return mediatorRecord
    }

    async _broadcastMediationRecord(mediatorRecord:MediatorRecord):Promise<void> {
        console.info(`Mediation Record Update for Mediator ${mediatorRecord.mediatorID}`, mediatorRecord)

    }
}



class MediationAdminAPI implements MediationAdminAPIInterface {
    service:MediationServiceInterface

    constructor(service:MediationServiceInterface){
        this.service = service
    }

    async addMediator(invite:MediatorInvite, mediatorID:string):Promise<void>{
        await this.service.addMediator(invite, mediatorID)
    }
}

export default new MediationService()