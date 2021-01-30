import InboundMessageHandler from '../messages/inboundMessages/inboundHandlerInterface'

import ProtocolHandlerInterface, { HandlerIdentifier, MessageRouteCallbacks } from './protocolHandlerInterface'

export default class BaseProtocolHandler implements ProtocolHandlerInterface {
    handlerIdentifier:HandlerIdentifier

    #inboundMessageHandler:InboundMessageHandler

    constructor(
        handlerIdentifier:HandlerIdentifier, 
        inboundMessageHandler:InboundMessageHandler
    ){
        this.handlerIdentifier = handlerIdentifier

        this.#inboundMessageHandler = inboundMessageHandler

        console.info(`Created Protocol Handler with Identifier: '${this.handlerIdentifier}'`)
    }

    registerMessages(messageCallbacks:MessageRouteCallbacks):void{
        try{
            console.info("Registering messages to callbacks: ", messageCallbacks)

            for(const route in messageCallbacks){
                this.#inboundMessageHandler.register(route, messageCallbacks[route])
            }
        } catch (error) {
            throw new Error("Unable to register protocols");
        }
    }
}