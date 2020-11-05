export default interface TransportMessagingInterface {
    sendOutboundMessage(messageBuffer:Buffer, endpoint:string, inboundMessagesCallback:Function):Promise<void>
}