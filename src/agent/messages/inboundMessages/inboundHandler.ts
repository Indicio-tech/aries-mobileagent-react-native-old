import HTTP from '../../../transports/http/http'
import InboundMessageHandlerInterface, { WalletName, WalletPassword, MessageURI, MessageRouteCallbacks, EncryptedMessage } from './inboundHandlerInterface'

//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

//Storage Dependencies
import StorageServiceInterface from '../../../storage'


export default class InboundMessageHandler implements InboundMessageHandlerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    
    #walletName:WalletName
    #walletPassword:WalletPassword

    #routeCallbacks:MessageRouteCallbacks = {}

    constructor(
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface,
        walletName:WalletName,
        walletPassword:WalletPassword
    ){
        console.info("Creating Inbound Message Handler");

        this.#walletService = walletService
        this.#storageService = storageService
        this.#walletName = walletName
        this.#walletPassword = walletPassword
    }

    _matchProtocol(URI: string){
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

    register(messageURI:MessageURI, callbackFunction:Function):void {
        console.info(`Registering Message callback for URI ${messageURI}`)
        
        //JamesKEbert TODO: Validate MessageURI
        
        this.#routeCallbacks[messageURI] = callbackFunction
    }

    async newInboundMessage(rawMessage:EncryptedMessage):Promise<void> {
        console.info("Received new message, Raw:", rawMessage)
        console.log(this.#walletService)
        const unpackedMessage = await this.#walletService.unpackMessage(
            this.#walletName, 
            this.#walletPassword, 
            JSON.stringify(rawMessage)
        )

        console.info("Unpacked message: ", unpackedMessage)
    }
}

