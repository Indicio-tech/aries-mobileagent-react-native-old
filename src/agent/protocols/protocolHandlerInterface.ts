import {Record, Static, String} from 'runtypes'

//JamesKEbert TODO: Add regex to make into format "name-version"
export const HandlerIdentifier = String
export type HandlerIdentifier = Static<typeof HandlerIdentifier>

export type MessageRouteCallbacks = {
  [route: string]: Function
}

export default interface ProtocolHandlerInterface {
  handlerIdentifier: HandlerIdentifier
}
