import {Record, Static, String} from 'runtypes'

//[-_./a-ZA-Z0-9]{8,64}
export const MessageID = String
export type MessageID = Static<typeof MessageID>

export const Message = Record({
    "@id": MessageID,
    "@type": String
})
export type Message = Static<typeof Message>