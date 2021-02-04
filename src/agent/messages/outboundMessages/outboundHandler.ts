import OutBoundMessageHandlerInterface, { WalletName, WalletPassword} from './outboundHandlerInterface'
import HTTP from '../../../transports/http/http'

//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

//Storage Dependencies
import StorageServiceInterface from '../../../storage'

import InboundMessageHandler from '../inboundMessages/inboundHandlerInterface'

export default class OutBoundMessageHandler implements OutBoundMessageHandlerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    #inboundMessageHandler:InboundMessageHandler

    #walletName:WalletName
    #walletPassword:WalletPassword

    constructor(
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface,
        inboundMessageHandler:InboundMessageHandler,
        walletName:WalletName,
        walletPassword:WalletPassword
    ){
        console.info("Creating Outbound Message Handler");

        this.#walletService = walletService
        this.#storageService = storageService
        this.#inboundMessageHandler = inboundMessageHandler
        this.#walletName = walletName
        this.#walletPassword = walletPassword
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

    async sendMessage(
        endpoint:string, 
        message:{}, 
        recipientKeys:string[], 
        senderVerkey:string,
        routingKeys:string[] = [],
    ):Promise<void> {
        console.info(`Preparing Message to send to ${endpoint}`, message)

        //Store Message

        //Process Message
        const messageString = JSON.stringify(message)

        const packedMessage:Buffer = await this.#walletService.packMessage(
            this.#walletName, 
            this.#walletPassword, 
            recipientKeys, 
            senderVerkey, 
            messageString
        )

        //console.log(packedMessage)
        //console.log(Buffer.from(packedMessage).toString('utf-8'))
        console.info("Packed Message to send", JSON.parse(Buffer.from(packedMessage).toString('utf-8')))

        await HTTP.sendOutboundMessage(packedMessage, endpoint, this.#inboundMessageHandler
            .newInboundMessage)
    }
}

