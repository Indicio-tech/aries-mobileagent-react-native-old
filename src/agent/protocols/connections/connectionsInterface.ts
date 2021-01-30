import { InternalService } from '../../services/connections/connectionsServiceInterface'
import { Invitation } from './messages'
import ProtocolHandlerInterface from '../protocolHandlerInterface'

export default interface ConnectionsHandlerInterface extends ProtocolHandlerInterface {
    processInvitation(invitation:Invitation):Promise<InternalService>
}