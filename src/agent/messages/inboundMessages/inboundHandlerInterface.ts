import {Record, Static, String} from 'runtypes'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>


export const MessageURI = String
export type MessageURI = Static<typeof MessageURI>

//[-_./a-ZA-Z0-9]{8,64}
export const MessageID = String
export type MessageID = Static<typeof MessageID>

export const Message = Record({
    "@id": MessageID,
    "@type": MessageURI
})
export type Message = Static<typeof Message>

export type MessageRouteCallbacks = {
    [route:string]:Function
}

export const EncryptedMessage = Record({
    ciphertext: String,
    iv: String,
    protected: String,
    tag: String
})
export type EncryptedMessage = Static<typeof EncryptedMessage>


export default interface InboundMessageHandlerInterface {
    register(messageURI:MessageURI, callbackFunction:Function):void
    newInboundMessage(rawMessage:EncryptedMessage):Promise<void>
}