import {Static, Record, String} from 'runtypes'

import {ConnectionID} from '../services/connections/connectionsServiceInterface'

export const EncryptedMessage = Record({
  ciphertext: String,
  iv: String,
  protected: String,
  tag: String,
})
export type EncryptedMessage = Static<typeof EncryptedMessage>

export default interface OutBoundMessageHandlerInterface {
  /**
   * Send a message to another agent
   * @param endpoint The endpoint of the agent
   * @param message The message to send
   * @param recipientKeys The recipients of the message
   * @param senderVerkey The sender verkey
   * @param routingKeys The routing keys for delivery of the message
   */
  sendMessage(
    endpoint: string,
    message: {},
    recipientKeys: string[],
    senderVerkey: string,
    routingKeys: string[],
  ): Promise<void>

  /**
   * Send a message to another agent by connectionID
   * @param connectionID The connection ID of the agent to send a message to
   * @param message The message to send
   */
  sendMessageByConnectionID(
    connectionID: ConnectionID,
    message: {},
  ): Promise<void>
}
