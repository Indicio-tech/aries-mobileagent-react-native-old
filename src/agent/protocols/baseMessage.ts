import {Record, Literal, Static, String} from 'runtypes'

//[-_./a-ZA-Z0-9]{8,64}
export const MessageID = String
export type MessageID = Static<typeof MessageID>

