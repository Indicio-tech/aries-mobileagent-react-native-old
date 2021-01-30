import {Static, Record, String, Literal, Array, Union, Undefined} from 'runtypes'
import { URLType } from '../../../utils/types'
import { MessageID } from '../baseMessage'

export const DID = String
export type DID = Static<typeof DID>

export const Endpoint = URLType
export type Endpoint = Static<typeof Endpoint>

export const PublicDIDInvitation = Record({
    "@type": Union(Literal("https://didcomm.org/connections/1.0/invitation"), Literal("did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation")),
    "@id": MessageID,
    "label": String,
    "did": DID
})
export type PublicDIDInvitation = Static<typeof PublicDIDInvitation>

export const InlineInvitation = Record({
    "@type": Union(Literal("https://didcomm.org/connections/1.0/invitation"), Literal("did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation")),
    "@id": MessageID,
    "label": String,
    "recipientKeys": Array(String),
    "serviceEndpoint": Union(Endpoint, Literal(''), DID),
    "routingKeys": Array(String).Or(Undefined)
})
export type InlineInvitation = Static<typeof InlineInvitation>

export const Invitation = InlineInvitation.Or(PublicDIDInvitation)
export type Invitation = Static<typeof Invitation>