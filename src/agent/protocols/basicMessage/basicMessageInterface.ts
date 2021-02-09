import {Connection, ConnectionID} from '../../services/connections/connectionsServiceInterface'
import ProtocolHandlerInterface from '../protocolHandlerInterface'

export default interface BasicMessageHandlerInterface
  extends ProtocolHandlerInterface {

  /**
   * Send a basic message to a connection
   * @param connectionID The connection ID to send it to
   * @param content The content to place in the basic message
   * @returns promise of void
   */
  sendBasicMessage(
    connectionID: ConnectionID,
    content: string
  ): Promise<void>

  /**
   * Receive a new basic message
   * @param unpackedMessage
   * @param connection
   * @returns promise of void
   */
  receiveBasicMessage(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void>
}
