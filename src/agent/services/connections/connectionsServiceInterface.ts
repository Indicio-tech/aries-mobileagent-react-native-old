import { Static, Record, String, Union, Literal, Partial, Boolean, Number, Null, Undefined, Array } from 'runtypes'
import { UUID, URLType } from '../../../utils/types'
import { DIDDoc, DIDKeyPair } from '../dids/didServiceInterface'
import { MediatorID } from '../mediation/mediatorServiceInterface'

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

export const Service = Record({
    recipientKeys: Array(String),
    routingKeys: Array(String),
    serviceEndpoint: URLType
})
export type Service = Static<typeof Service>

export const InvitationUses = Union(Literal("multi-use"), Number)
export type InvitationUses = Static<typeof InvitationUses>

export const InvitationRecord = Record({
    invitationID: InvitationID,
    origin: Union(Literal("local"), Literal("external")),
    role: ConnectionRoles,
    service: Service,
    invitation: Invitation,
    rawInvitation: String,
    uses: InvitationUses,
}).And(Partial({
    autoConnect: Boolean,
}))
export type InvitationRecord = Static<typeof InvitationRecord>


//Mediation Records
export const MediationStates = Union(
    Literal("not-mediated"), 
    Literal("keylist-update-sent"), 
    Literal("mediated"), 
)
export type MediationStates = Static<typeof MediationStates>

export const MediationDetails = Record({
    // mediator
    mediator: MediatorID.Or(Null),
    state: MediationStates,
})
export type MediationDetails = Static<typeof MediationDetails>


//Connection Records
export const ConnectionID = UUID
export type ConnectionID = Static<typeof ConnectionID>

export const ConnectionStates = Union(
    Literal("invite-received"),
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
    agentDIDKeyPair: DIDKeyPair,
    agentDIDDoc: DIDDoc,
    internalService: Service,
    externalDIDDoc: DIDDoc.Or(Null),
    externalService: Service,
    invitationID: UUID,
    createdAt: String,
    updatedAt: String,
    mediation: MediationDetails,
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
    sendRequest(connection:Connection, label:string, returnRoute:boolean):Promise<void>
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