import {
    Static,
    Record,
    String,
    Literal,
    Union,
    Partial,
  } from 'runtypes'
  import {MessageID} from '../baseMessage'
  
  //Ping
  export const BasicMessage = Record({
    '@type': Union(
      Literal('https://didcomm.org/basicmessage/1.0/message'),
      Literal('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message'),
    ),
    '@id': MessageID,
    content: String
  }).And(
    Partial({
      "~l10n": Record({
          locale: String
      }),
      sent_time: String,
    }),
  )
  export type BasicMessage = Static<typeof BasicMessage>
  