import {Record, Static, String, Union, Literal} from 'runtypes'

export const MessageURI = String
export type MessageURI = Static<typeof MessageURI>

//[-_./a-ZA-Z0-9]{8,64}
export const MessageID = String
export type MessageID = Static<typeof MessageID>

export const Message = Record({
  '@id': MessageID,
  '@type': MessageURI,
})
export type Message = Static<typeof Message>

export type MessageRouteCallbacks = {
  [route: string]: Function
}

export const EncryptedMessage = Record({
  ciphertext: String,
  iv: String,
  protected: String,
  tag: String,
})
export type EncryptedMessage = Static<typeof EncryptedMessage>

export const SignatureDecorator = Record({
  '@type': Union(
    Literal('https://didcomm.org/signature/1.0/ed25519Sha512_single'),
    Literal(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/signature/1.0/ed25519Sha512_single',
    ),
  ),
  signature: String,
  sig_data: String,
  signer: String,
})
export type SignatureDecorator = Static<typeof SignatureDecorator>

export default interface InboundMessageHandlerInterface {
  register(messageURI: MessageURI, callbackFunction: Function): void
  newInboundMessage(rawMessage: EncryptedMessage): Promise<void>
}
