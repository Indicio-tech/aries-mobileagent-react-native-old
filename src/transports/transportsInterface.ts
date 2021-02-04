export default interface TransportMessagingInterface {
    sendOutboundMessage(messageBuffer:Buffer, endpoint:string, inboundCallback:Function):Promise<void>
}