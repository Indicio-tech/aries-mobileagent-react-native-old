import { v4 as uuidv4 } from 'uuid'
import { InboundMessageHandler, OutboundMessageHandler } from '../../messages'
import ConnectionsService, { Connection, Service } from '../../services/connections/connectionsServiceInterface'
import { DIDDoc } from '../../services/dids/didServiceInterface'

import BaseProtocolHandler from '../baseProtocolHandler'
import ConnectionsHandlerInterface from './connectionsInterface'

import { Invitation, PublicDIDInvitation, ConnectionRequest } from './messages'

export default class ConnectionsHandler extends BaseProtocolHandler implements ConnectionsHandlerInterface {
    #connectionsService:ConnectionsService
    #outboundMessageHandler:OutboundMessageHandler

    constructor(inboundMessageHandler:InboundMessageHandler, outboundMessageHandler:OutboundMessageHandler,connectionsService:ConnectionsService){
        super("connections-1.0", inboundMessageHandler)

        //Setup necessary services
        this.#outboundMessageHandler = outboundMessageHandler
        this.#connectionsService = connectionsService

        //Setup message routes
        // this.registerMessages({
        //     "https://didcomm.org/connections/1.0/response": this.response
        //did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation
        // })
    }

    async processInvitation(invitation:Invitation):Promise<Service> {
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

    async sendRequest(
        label:string, 
        didDoc:DIDDoc, 
        endpoint:string, 
        recipientKeys:string[], 
        senderVerkey:string,
        routingKeys:string[] = [],
        returnRoute:boolean = false,
    ):Promise<void> {
        console.info("Sending connection request")

        let request:ConnectionRequest = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request",
            "@id": uuidv4(),
            label:label,
            connection:{
                DID:didDoc.id,
                DIDDoc:didDoc
            },
        }

        if(returnRoute){
            request = {
                ...request,
                '~transport': {
                    return_route: 'all',
                },
            }
        }

        if(!ConnectionRequest.guard(request)){
            throw new Error("Connection request was not created correctly")
        }

        console.info("Created Connection Request", request)

        await this.#outboundMessageHandler.sendMessage(endpoint, request, recipientKeys, senderVerkey, routingKeys)
    }
}