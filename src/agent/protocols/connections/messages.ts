import {
  Static,
  Record,
  String,
  Literal,
  Array,
  Union,
  Undefined,
  Partial,
} from 'runtypes'
import {URLType} from '../../../utils/types'
import {DIDDoc} from '../../services/dids/didServiceInterface'
import {MessageID} from '../baseMessage'

export const DID = String
export type DID = Static<typeof DID>

export const Endpoint = URLType
export type Endpoint = Static<typeof Endpoint>

//Invitations
export const PublicDIDInvitation = Record({
  '@type': Union(
    Literal('https://didcomm.org/connections/1.0/invitation'),
    Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation'),
  ),
  '@id': MessageID,
  label: String,
  did: DID,
})
export type PublicDIDInvitation = Static<typeof PublicDIDInvitation>

export const InlineInvitation = Record({
  '@type': Union(
    Literal('https://didcomm.org/connections/1.0/invitation'),
    Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation'),
  ),
  '@id': MessageID,
  label: String,
  recipientKeys: Array(String),
  serviceEndpoint: Union(Endpoint, Literal(''), DID),
}).And(
  Partial({
    routingKeys: Array(String),
  }),
)
export type InlineInvitation = Static<typeof InlineInvitation>

export const Invitation = InlineInvitation.Or(PublicDIDInvitation)
export type Invitation = Static<typeof Invitation>

//Connection Request
export const ConnectionRequest = Record({
  '@type': Union(
    Literal('https://didcomm.org/connections/1.0/request'),
    Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request'),
  ),
  '@id': MessageID,
  label: String,
  connection: Record({
    DID: DID,
    DIDDoc: DIDDoc,
  }),
}).And(
  Partial({
    '~transport': Record({
      return_route: Union(Literal('all')),
    }),
  }),
)
export type ConnectionRequest = Static<typeof ConnectionRequest>

//Connection Response
export const ConnectionResponse = Record({
  '@type': Union(
    Literal('https://didcomm.org/connections/1.0/response'),
    Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response'),
  ),
  '@id': MessageID,
  connection: Record({
    DID: DID,
    DIDDoc: DIDDoc,
  }),
})
export type ConnectionResponse = Static<typeof ConnectionResponse>
