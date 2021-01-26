import { InboundMessageHandler, OutboundMessageHandler } from '../../messages'


import ConnectionsManager from '../../services/connectionsManager/connectionsManager'

import { HandlerIdentifier } from '../protocolHandlerInterface'
import BaseProtocolHandler from '../baseProtocolHandler'

import ConnectionsHandlerInterface from './connectionsInterface'

export default class ConnectionsHandler extends BaseProtocolHandler implements ConnectionsHandlerInterface {
    #connectionsManager:ConnectionsManager

    constructor(connectionManager:ConnectionsManager){
        super("connections-1.0")

        //Setup necessary services
        this.#connectionsManager = connectionManager

        //Setup message routes
        this.registerMessages({
            "https://didcomm.org/connections/1.0/response": this.response
        })
    }

    async response():Promise<void>{
        console.info("Connections Handler did something")
    }
}