import {Static, Record, String, Literal, Array, Undefined} from 'runtypes'
import { URLType } from '../../../utils/types'
import { MessageID } from '../../messages/messagesInterface'

export const Invitation = Record({
    "@type": Literal("https://didcomm.org/connections/1.0/invitation"),
    "@id": MessageID,
    "label": String,
    "recipientKeys": Array(String),
    "serviceEndpoint": URLType.Or(Literal('')),
    "routingKeys": Array(String).Or(Undefined)
})
export type Invitation = Static<typeof Invitation>

export default interface ConnectionsHandlerInterface {
    protocolURI:string
    inboundMessage():Promise<void>
}