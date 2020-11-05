import { Connection } from '../../services/connections/connectionsServiceInterface';
import ProtocolHandlerInterface from '../protocolHandlerInterface'

export default interface TrustPingHandlerInterface extends ProtocolHandlerInterface {
    /**
     * Receive a new trust ping response
     * @param unpackedMessage 
     * @param connection 
     * @returns promise of void
     */
    receiveResponse(unpackedMessage:any, connection:Connection):Promise<void>
}