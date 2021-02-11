import {Service} from '../../services/connections/connectionsServiceInterface'
import {Invitation} from './messages'
import ProtocolHandlerInterface from '../protocolHandlerInterface'
import {DIDDoc} from '../../services/dids/didServiceInterface'

export default interface ConnectionsHandlerInterface
  extends ProtocolHandlerInterface {
  processInvitation(invitation: Invitation): Promise<Service>
  sendRequest(
    label: string,
    didDoc: DIDDoc,
    endpoint: string,
    recipientKeys: string[],
    senderVerkey: string,
    routingKeys: string[],
    returnRoute: boolean,
  ): Promise<void>
}
