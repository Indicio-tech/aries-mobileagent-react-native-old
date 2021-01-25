import { Static, Record, String, Union, Literal, Number, Null, Undefined, Array } from 'runtypes'
import { UUID, URLType } from '../../utils/types'

import { MediationDetails } from '../mediation/mediatorInterface'
import { Invitation } from '../protocols/connections/connectionsInterface'

export const DIDDoc = Record({})
export type DIDDoc = Static<typeof DIDDoc>

export const ConnectionRoles = Union(Literal("mediator"), Literal("peer"))
export type ConnectionRoles = Static<typeof ConnectionRoles>

export const ConnectionStates = Union(
    Literal("invitation-generated"), 
    Literal("invitation-received"),
    Literal("connection-requested"),
    Literal("connection-request-received"),
    Literal("response-sent"),
    Literal("response-received"),
    Literal("connection-error"),
    Literal("connected"),
)
export type ConnectionStates = Static<typeof ConnectionStates>


export const Connection = Record({
    connectionID: UUID,
    role: ConnectionRoles,
    state: ConnectionStates,
    agentDIDDoc: DIDDoc.Or(Null),
    foreignDIDDoc: DIDDoc.Or(Null),
    invitation: Invitation,
    rawInvitation: String,
    createdAt: Number,
    updatedAt: Number,
    mediation: MediationDetails.Or(Undefined),
})
export type Connection = Static<typeof Connection>

export default interface ConnectionsManagerInterface {
    
}