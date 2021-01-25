import { InboundMessageHandler, OutboundMessageHandler } from '../../messages'

import ConnectionsHandlerInterface from './connectionsInterface'

import { ProtocolURI } from '../protocolsInterface'

export default class ConnectionsHandler implements ConnectionsHandlerInterface {
    protocolURI:ProtocolURI = "https://didcomm.org/connections/1.0/"
    #inboundHandler:InboundMessageHandler

    constructor(inboundHandler:InboundMessageHandler){
        console.info("Created Connections Protocol Handler")

        this.#inboundHandler = inboundHandler
    }

    async inboundMessage():Promise<void> {
        console.log("Inbound Connection Message")
    }
}