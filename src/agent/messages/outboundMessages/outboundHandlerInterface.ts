import { Static, Record, String,} from 'runtypes'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>


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
        endpoint:string, 
        message:{}, 
        recipientKeys:string[], 
        senderVerkey:string,
        routingKeys:string[],
    ):Promise<void>
}