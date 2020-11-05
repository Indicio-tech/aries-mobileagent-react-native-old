import { v4 as uuidv4 } from 'uuid'

import { Connection, ConnectionID } from "../../services/connections/connectionsServiceInterface";
import OutboundMessageHandler from '../../outboundMessages/outboundHandler'

import { PingMessage } from "./messages";

import BaseProtocolHandler from "../baseProtocolHandler";
import TrustPingHandlerInterface from "./trustPingInterface";

class TrustPingHandler extends BaseProtocolHandler implements TrustPingHandlerInterface {
    messageCallbacks = {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping_response": this.receiveResponse.bind(this)
    }
    
    constructor(){
        super("trust-ping-1.0")
    }

    async sendTrustPing(connectionID:ConnectionID, responseRequest:boolean = false, returnRoute:boolean = false):Promise<void> {
        let trustPing:PingMessage = {
            "@type": "https://didcomm.org/trust_ping/1.0/ping",
            "@id": uuidv4(),
            "response_requested": responseRequest
        }
        if(returnRoute){
            trustPing["~transport"] = {
                return_route: "all"
            }
        }

        console.info("Sending trust ping", trustPing)

        //Validate message
        PingMessage.check(trustPing)

        await OutboundMessageHandler.sendMessageByConnectionID(connectionID, trustPing)
    }

    async receiveResponse(unpackedMessage:any, connection:Connection):Promise<void> {
        throw new Error("Received unexpected trust ping response, handling not implemented")
    }
}

export default new TrustPingHandler()