import InboundMessageHandlerInterface, { ProtocolURI } from './inboundHandlerInterface'

export default class InboundMessageHandler implements InboundMessageHandlerInterface {
    constructor(){
        console.info("Creating Inbound Message Handler");
    }

    matchProtocol(URI: string){
        //Regex match to protocol message type identifiers - Only built for MTURIs currently - (https://github.com/hyperledger/aries-rfcs/tree/master/concepts/0003-protocols#message-type-and-protocol-identifier-uris)
        const regexMatchType = URI.match(
            /(.*?)([a-z0-9._-]+)\/(\d[^/]*)\/([a-z0-9._-]+)$/,
        )
        //Regex to return protocol name
        const protocol = URI.match(/.*?[a-z0-9._-]+\/\d[^/]*/)

        console.log(regexMatchType, protocol);

        if (regexMatchType && protocol) {
            const matchedType = {
            docURI: regexMatchType[1],
            protocolName: regexMatchType[2],
            version: regexMatchType[3],
            messageName: regexMatchType[4],
            }
            console.log(matchedType)
        }
    }

    register(callbackFunction:Function, protocolURI:ProtocolURI):void {
        console.info(`Registering Protocol callback for URI ${protocolURI}`)
        callbackFunction()
    }
}

