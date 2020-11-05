import {Static, Record, String, Literal, Boolean, Union, Partial } from 'runtypes'
import { MessageID } from '../baseMessage'

//Ping
export const PingMessage = Record({
    "@type": Union(Literal("https://didcomm.org/trust_ping/1.0/ping"), Literal("did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping")),
    "@id": MessageID,
    response_requested: Boolean
}).And(Partial({
    "~timing": Record({}), //TODO: Define timing decorator
    comment: String,
    '~transport': Record({
        return_route: Union(Literal('all')),
    }),
}))
export type PingMessage = Static<typeof PingMessage>

//Ping Response
export const PingResponseMessage = Record({
    "@type": Union(Literal("https://didcomm.org/trust_ping/1.0/ping_response"), Literal("did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping_response")),
    "@id": MessageID,
    "~timing": Record({}), //TODO: Define timing decorator
    comment: String
})
export type PingResponseMessage = Static<typeof PingResponseMessage>