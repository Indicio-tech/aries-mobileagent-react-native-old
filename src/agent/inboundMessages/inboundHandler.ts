import base64url from 'base64url'

//Wallet Dependencies
import WalletService from '../../wallet/indy'

//Storage Dependencies
import StorageService from '../../storage/nonSecrets'

import connectionsService from '../services/connections/connectionsService'
import {Connection} from '../services/connections/connectionsServiceInterface'

import InboundMessageHandlerInterface, {
  MessageURI,
  MessageRouteCallbacks,
  EncryptedMessage,
  SignatureDecorator,
} from './inboundHandlerInterface'

class InboundMessageHandler implements InboundMessageHandlerInterface {
  #routeCallbacks: MessageRouteCallbacks = {}

  constructor() {
    console.info('Creating Inbound Message Handler')
  }

  _matchProtocol(URI: string) {
    //Regex match to protocol message type identifiers - Only built for MTURIs currently - (https://github.com/hyperledger/aries-rfcs/tree/master/concepts/0003-protocols#message-type-and-protocol-identifier-uris)
    const regexMatchType = URI.match(
      /(.*?)([a-z0-9._-]+)\/(\d[^/]*)\/([a-z0-9._-]+)$/,
    )
    //Regex to return protocol name
    const protocol = URI.match(/.*?[a-z0-9._-]+\/\d[^/]*/)

    console.log(regexMatchType, protocol)

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

  register(messageURI: MessageURI, callbackFunction: Function): void {
    console.info(`Registering Message callback for URI ${messageURI}`)

    //JamesKEbert TODO: Validate MessageURI

    this.#routeCallbacks[messageURI] = callbackFunction
  }

  async newInboundMessage(rawMessage: EncryptedMessage): Promise<void> {
    console.info('Received new message, Raw:', rawMessage)

    //Unpacked message
    const unpackedMessage = await this._unpackMessage(rawMessage)
    console.info('Unpacked message: ', unpackedMessage)

    //Check for relevant decorators
    const processedMessage = {
      recipient_verkey: unpackedMessage.recipient_verkey,
      sender_verkey: unpackedMessage.sender_verkey,
      message: await this._verifySignatures(unpackedMessage.message),
    }
    console.info('Processed Message:', processedMessage)

    //Store message

    //Identify Protocol
    let messageType = processedMessage.message['@type']

    //Find connection that message applies to
    let connection: Connection | null = await this._findConnection(
      processedMessage.recipient_verkey,
    )

    if (Connection.guard(connection)) {
      console.info(
        `New message for Connection ${connection.connectionID} of type ${messageType}`,
        connection,
      )
    } else {
      if (
        messageType !==
        ('https://didcomm.org/connections/1.0/request' ||
          'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request')
      ) {
        console.warn(
          `Unable to find connection for new message with processedMessage:`,
          processedMessage,
        )
      }
    }

    //Relay message to appropriate protocol handlers
    await this._broadcastToHandlers(messageType, processedMessage, connection)
  }

  async _unpackMessage(rawMessage: EncryptedMessage): Promise<any> {
    const unpackedMessage = await WalletService.unpackMessage(
      JSON.stringify(rawMessage),
    )
    let unpackedJSON = JSON.parse(unpackedMessage)
    unpackedJSON.message = JSON.parse(unpackedJSON.message)

    return unpackedJSON
  }

  async _verifySignatures(message: any): Promise<any> {
    console.info('Verifying Signatures')
    //Signature Decorator
    const signatureRegex = /([a-z0-9._-]+)(~sig)$/

    for (const key of Object.keys(message)) {
      const signatureDecorator = signatureRegex.test(key)
      const signatureRegexGroups = key.match(signatureRegex)

      //TODO: Abstract somewhere else?
      if (signatureDecorator && signatureRegexGroups) {
        let signatureField = message[key]

        SignatureDecorator.check(signatureField)

        //Decode Base64URL and prepare to verify with Indy
        //Assign signerVerkey
        const signerVerkey = signatureField.signer
        //Assign and decode base64URL values
        const signature: number[] = Array.from(
          base64url.toBuffer(signatureField.signature),
        )
        const signedData: number[] = Array.from(
          base64url.toBuffer(signatureField.sig_data),
        )

        const valid = await WalletService.verifyData(
          signerVerkey,
          signedData,
          signature,
        )

        //TODO: Identify proper procedure when encountering invalid signature
        if (!valid) {
          throw new Error('Signature not valid')
        }

        //Replace signed data without signature. Decode from Base64URL, remove first 8 bytes, and parse into JSON Object.
        let replacedField = JSON.parse(
          base64url.toBuffer(signatureField.sig_data).slice(8).toString(),
        )

        //Such as connection~sig
        //delete message[key]
        //Such as connection
        message[signatureRegexGroups[1]] = replacedField
      }
    }

    return message
  }

  async _findConnection(recipientVerkey: string): Promise<Connection | null> {
    //Identify Connection for message
    const connections: any = await connectionsService.searchConnectionRecords([
      recipientVerkey,
    ])

    if (Connection.guard(connections[0].content)) {
      return connections[0].content
    } else {
      return null
    }
  }

  async _broadcastToHandlers(
    messageType: string,
    unpackedMessage: {},
    connection: Connection | null,
  ): Promise<void> {
    console.info('Broadcasting message to protocol message handlers')

    //Determine if the message has been handled somewhere
    let handled: boolean = false

    for (const messageURI in this.#routeCallbacks) {
      if (messageURI === messageType) {
        handled = true
        await this.#routeCallbacks[messageURI](unpackedMessage, connection)
      }
    }

    if (!handled) {
      //TODO: Handle internal error/logging and return of a problem report
      throw new Error(`Unidentified Message with URI ${messageType}`)
    }
  }
}

export default new InboundMessageHandler()
