import { Static, Record, String, Union, Literal, Boolean, Number, Null, Undefined, Array } from 'runtypes'
import { UUID, URLType } from '../../../utils/types'

import { MediationDetails } from '../mediation/mediatorServiceInterface'

import { Invitation } from '../../protocols/connections/messages'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>


export const ConnectionRoles = Union(Literal("mediation-recipient"), Literal("peer"))
export type ConnectionRoles = Static<typeof ConnectionRoles>

//Invitation Records
export const InvitationID = UUID
export type InvitationID = Static<typeof InvitationID>

export const InternalService = Record({
    recipientKeys: Array(String),
    routingKeys: Array(String),
    serviceEndpoint: URLType
})
export type InternalService = Static<typeof InternalService>

export const InvitationUses = Union(Literal("multi-use"), Number)
export type InvitationUses = Static<typeof InvitationUses>

export const InvitationRecord = Record({
    invitationID: InvitationID,
    origin: Union(Literal("local"), Literal("external")),
    role: ConnectionRoles,
    service: InternalService,
    invitation: Invitation,
    rawInvitation: String,
    autoConnect: Boolean,
    uses: InvitationUses,
})
export type InvitationRecord = Static<typeof InvitationRecord>



//Connection Records
export const ConnectionID = UUID
export type ConnectionID = Static<typeof ConnectionID>

export const DIDDoc = Record({})
export type DIDDoc = Static<typeof DIDDoc>

export const ConnectionStates = Union(
    Literal("initiated"),
    Literal("request-sent"),
    Literal("response-received"),
    Literal("connected"),

    Literal("request-received"),
    Literal("response-sent"),
    Literal("connected"),

    Literal("connection-error"),
)
export type ConnectionStates = Static<typeof ConnectionStates>

export const Connection = Record({
    connectionID: ConnectionID,
    role: ConnectionRoles,
    state: ConnectionStates,
    agentVerkey: String,
    agentDIDDoc: DIDDoc.Or(Null),
    externalService: InternalService,
    externalDIDDoc: DIDDoc.Or(Null),
    invitationID: UUID,
    createdAt: String,
    updatedAt: String,
    mediation: MediationDetails.Or(Undefined),
})
export type Connection = Static<typeof Connection>

export default interface ConnectionsServiceInterface {
    generateInvitation():Promise<Invitation>
    receiveInvitation(
        invitationURL:string, 
        role:ConnectionRoles, 
        autoConnect:boolean
    ):Promise<InvitationRecord>
    _processInvitation(invitationURL:string):Promise<Invitation>
    storeInvitationRecord(invitationRecord:InvitationRecord):Promise<void>
    getInvitationRecord(invitationID:InvitationID):Promise<InvitationRecord>
    // updateInvitation():Promise<void>

    createConnectionByInvitationID(invitationID:InvitationID):Promise<Connection>
    // createConnectionRecord():Promise<ConnectionID>
    // storeConnectionRecord():Promise<void>
    // getConnectionRecord():Promise<Connection>
    // updateConnection():Promise<void>
    // deleteConnection():Promise<void>

    // sendConnectionRequest():Promise<void>

    // sendConnectionResponse():Promise<void>
}


export interface ConnectionsServiceAdminInterface {
    receiveInvitation(
        invitationURL:string, 
        role:ConnectionRoles, 
        autoConnect:boolean
    ):Promise<InvitationRecord>
    createConnectionByInvitationID(invitationID:InvitationID):Promise<Connection>
}