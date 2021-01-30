import { InboundMessageHandler, OutboundMessageHandler } from '../../messages'
import ConnectionsService, { InternalService } from '../../services/connections/connectionsServiceInterface'

import BaseProtocolHandler from '../baseProtocolHandler'
import ConnectionsHandlerInterface from './connectionsInterface'

import { Invitation, PublicDIDInvitation } from './messages'

export default class ConnectionsHandler extends BaseProtocolHandler implements ConnectionsHandlerInterface {
    #connectionsService:ConnectionsService

    constructor(inboundMessageHandler:InboundMessageHandler, connectionsService:ConnectionsService){
        super("connections-1.0", inboundMessageHandler)

        //Setup necessary services
        this.#connectionsService = connectionsService

        //Setup message routes
        // this.registerMessages({
        //     "https://didcomm.org/connections/1.0/response": this.response
        // })
    }

    async processInvitation(invitation:Invitation):Promise<InternalService> {
        try{
            //Validate Message
            Invitation.check(invitation)

            if(PublicDIDInvitation.guard(invitation)){
                throw new Error("Public DID Invitations are not currently supported")
            }

            let routingKeys:string[] = [];
            if(invitation.routingKeys){
                routingKeys = invitation.routingKeys
            }

            return {
                recipientKeys: invitation.recipientKeys,
                routingKeys: routingKeys,
                serviceEndpoint: invitation.serviceEndpoint
            }
        } catch(error) {
            console.log(error)
            throw new Error("Error while processing invitation")
        }
    }
}