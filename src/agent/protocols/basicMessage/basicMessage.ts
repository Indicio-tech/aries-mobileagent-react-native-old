import {v4 as uuidv4} from 'uuid'

import {
  Connection,
  ConnectionID,
} from '../../services/connections/connectionsServiceInterface'
import OutboundMessageHandler from '../../outboundMessages/outboundHandler'

import {BasicMessage} from './messages'

import BaseProtocolHandler from '../baseProtocolHandler'
import BasicMessageHandlerInterface from './basicMessageInterface'

class BasicMessageHandler
  extends BaseProtocolHandler
  implements BasicMessageHandlerInterface {
  messageCallbacks = {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message': this.receiveBasicMessage.bind(
      this,
    ),
  }

  constructor() {
    super('basic-message-1.0')
  }

  async sendBasicMessage(
    connectionID: ConnectionID,
    content: string
  ): Promise<void> {
    let basicMessage:BasicMessage = {
      '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message',
      '@id': uuidv4(),
      content: content
    }

    console.info(`Sending basic message to connectionID ${connectionID}`, basicMessage)

    //Validate message
    BasicMessage.check(basicMessage)

    await OutboundMessageHandler.sendMessageByConnectionID(
      connectionID,
      basicMessage,
    )
  }

  async receiveBasicMessage(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void> {

    BasicMessage.check(unpackedMessage.message)

    console.info(`New Basic Message from connection ${connection.connectionID}:`, unpackedMessage.message)


    console.warn("Handling of basic messages not implemented, sending basic message to inform connection")

    await this.sendBasicMessage(connection.connectionID, "AutoReply: This AMA-RN Agent does not contain messaging support.")
  }
}

export default new BasicMessageHandler()
