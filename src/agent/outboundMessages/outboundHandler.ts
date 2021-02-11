import url from 'url'
import HTTP from '../../transports/http/http'
import WS from '../../transports/ws/ws'

//Wallet Dependencies
import WalletService from '../../wallet/indy'

//Storage Dependencies
import StorageService from '../../storage/nonSecrets'

import InboundMessageHandler from '../inboundMessages/inboundHandler'

import OutBoundMessageHandlerInterface, {
  EncryptedMessage,
} from './outboundHandlerInterface'
import connectionsService from '../services/connections/connectionsService'
import {
  Connection,
  ConnectionID,
} from '../services/connections/connectionsServiceInterface'

class OutBoundMessageHandler implements OutBoundMessageHandlerInterface {
  constructor() {
    console.info('Creating Outbound Message Handler')
  }

  matchProtocol(URI: string) {
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

  async sendMessage(
    endpoint: string,
    message: {},
    recipientKeys: string[],
    senderVerkey: string,
    routingKeys: string[] = [],
  ): Promise<void> {
    console.info(`Preparing Message to send to ${endpoint}`, message)

    //Store Message

    //Process Message
    const messageString = JSON.stringify(message)

    const packedMessage: Buffer = await WalletService.packMessage(
      recipientKeys,
      senderVerkey,
      messageString,
    )

    console.info(
      'Packed Message to send',
      JSON.parse(Buffer.from(packedMessage).toString('utf-8')),
    )

    //Create callback
    const inboundMessagesCallback = (rawMessage: EncryptedMessage) => {
      InboundMessageHandler.newInboundMessage(rawMessage)
    }

    await this._sendMessageToTransport(
      packedMessage,
      endpoint,
      inboundMessagesCallback,
    )
  }

  async _sendMessageToTransport(
    packedMessage: Buffer,
    endpoint: string,
    inboundMessagesCallback: Function,
  ): Promise<void> {
    let endpointURL = url.parse(endpoint)

    switch (endpointURL.protocol) {
      case 'https:':
      case 'http:':
        await HTTP.sendOutboundMessage(
          packedMessage,
          endpoint,
          inboundMessagesCallback,
        )
        break
      case 'wss:':
      case 'ws:':
        await WS.sendOutboundMessage(
          packedMessage,
          endpoint,
          inboundMessagesCallback,
        )
        break
      default:
        throw new Error(
          `Unidentified Transport Protocol ${endpointURL.protocol}`,
        )
    }
  }

  async sendMessageByConnectionID(
    connectionID: ConnectionID,
    message: {},
  ): Promise<void> {
    console.info(`Sending Message to connection ${connectionID}`)

    const connection: Connection = await connectionsService.getConnectionRecord(
      connectionID,
    )

    this.sendMessage(
      connection.externalService.serviceEndpoint,
      message,
      connection.externalService.recipientKeys,
      connection.agentDIDKeyPair.key,
      connection.externalService.routingKeys,
    )
  }
}

export default new OutBoundMessageHandler()
