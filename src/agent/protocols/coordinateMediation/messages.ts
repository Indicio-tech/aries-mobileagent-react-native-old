import {
  Static,
  Record,
  String,
  Literal,
  Boolean,
  Union,
  Partial,
  Array,
} from 'runtypes'
import {MessageID} from '../baseMessage'

//Mediate Request
export const MediateRequestMessage = Record({
  '@type': Union(
    Literal('https://didcomm.org/coordinate-mediation/1.0/mediate-request'),
    Literal(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/mediate-request',
    ),
  ),
  '@id': MessageID,
  mediator_terms: Array(String),
  recipient_terms: Array(String),
}).And(
  Partial({
    '~transport': Record({
      return_route: Union(Literal('all')),
    }),
  }),
)
export type MediateRequestMessage = Static<typeof MediateRequestMessage>

//Mediate Deny
export const MediateDenyMessage = Record({
  '@type': Union(
    Literal('https://didcomm.org/coordinate-mediation/1.0/deny'),
    Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/'),
  ),
  '@id': MessageID,
  mediator_terms: Array(String),
  recipient_terms: Array(String),
})
export type MediateDenyMessage = Static<typeof MediateDenyMessage>

//Mediate Grant
export const MediateGrantMessage = Record({
  '@type': Union(
    Literal('https://didcomm.org/coordinate-mediation/1.0/mediate-grant'),
    Literal(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/mediate-grant',
    ),
  ),
  '@id': MessageID,
  endpoint: String,
  routing_keys: Array(String),
})
export type MediateGrantMessage = Static<typeof MediateGrantMessage>

//Keylists
export const KeylistUpdate = Record({
  recipient_key: String,
  action: Union(Literal('add'), Literal('remove')),
})
export type KeylistUpdate = Static<typeof KeylistUpdate>

export const KeylistUpdateResults = Record({
  recipient_key: String,
  action: Union(Literal('add'), Literal('remove')),
  result: Union(
    Literal('client_error'),
    Literal('server_error'),
    Literal('no_change'),
    Literal('success'),
  ),
})
export type KeylistUpdateResults = Static<typeof KeylistUpdateResults>

//Keylist Update
export const KeylistUpdateMessage = Record({
  '@type': Union(
    Literal('https://didcomm.org/coordinate-mediation/1.0/keylist-update'),
    Literal(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/keylist-update',
    ),
  ),
  '@id': MessageID,
  updates: Array(KeylistUpdate),
}).And(
  Partial({
    '~transport': Record({
      return_route: Union(Literal('all')),
    }),
  }),
)
export type KeylistUpdateMessage = Static<typeof KeylistUpdateMessage>

//Keylist Update Response
export const KeylistUpdateResponse = Record({
  '@type': Union(
    Literal(
      'https://didcomm.org/coordinate-mediation/1.0/keylist-update-response',
    ),
    Literal(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/keylist-update-response',
    ),
  ),
  '@id': MessageID,
  updated: Array(KeylistUpdateResults),
})
export type KeylistUpdateResponse = Static<typeof KeylistUpdateResponse>
