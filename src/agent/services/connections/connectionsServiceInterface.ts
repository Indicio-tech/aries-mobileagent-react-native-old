import {
  Static,
  Record,
  String,
  Union,
  Literal,
  Partial,
  Boolean,
  Number,
  Null,
  Undefined,
  Array,
} from 'runtypes'
import {UUID, URLType} from '../../../utils/types'
import {DIDDoc, DIDKeyPair} from '../dids/didServiceInterface'

import {Invitation} from '../../protocols/connections/messages'
import {StorageRecord} from '../../../storage'

export const ConnectionRoles = Union(
  Literal('mediation-recipient'),
  Literal('peer'),
)
export type ConnectionRoles = Static<typeof ConnectionRoles>

//Invitation Records
export const InvitationID = UUID
export type InvitationID = Static<typeof InvitationID>

export const Service = Record({
  recipientKeys: Array(String),
  routingKeys: Array(String),
  serviceEndpoint: URLType,
})
export type Service = Static<typeof Service>

export const InvitationUses = Union(Literal('multi-use'), Number)
export type InvitationUses = Static<typeof InvitationUses>

export const InvitationRecord = Record({
  invitationID: InvitationID,
  origin: Union(Literal('local'), Literal('external')),
  role: ConnectionRoles,
  label: String,
  service: Service,
  invitation: Invitation,
  rawInvitation: String,
  uses: InvitationUses,
}).And(
  Partial({
    autoConnect: Boolean,
  }),
)
export type InvitationRecord = Static<typeof InvitationRecord>

//Connection Records
export const ConnectionID = UUID
export type ConnectionID = Static<typeof ConnectionID>

export const ConnectionStates = Union(
  Literal('invite-received'),
  Literal('request-sent'),
  Literal('response-received'),
  Literal('active'),

  Literal('request-received'),
  Literal('response-sent'),
  Literal('active'),

  Literal('connection-error'),
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
  label: String,
  externalLabel: String,
  createdAt: String,
  updatedAt: String,
  mediatorID: String.Or(Null),
})
export type Connection = Static<typeof Connection>

export default interface ConnectionsServiceInterface {
  generateInvitation(): Promise<Invitation>
  receiveInvitation(
    invitationURL: string,
    role: ConnectionRoles,
  ): Promise<InvitationRecord>

  //Invitation Records

  _processInvitation(invitationURL: string): Promise<Invitation>

  _addInvitationRecord(invitationRecord: InvitationRecord): Promise<void>
  getInvitationRecord(invitationID: InvitationID): Promise<InvitationRecord>
  // updateInvitation():Promise<void>

  //Workflows

  acceptInvitation(
    invitationID: InvitationID,
    label: string,
    mediatorID: string | null,
  ): Promise<ConnectionID>

  sendRequest(connection: Connection, returnRoute: boolean): Promise<void>
  receiveResponse(didDoc: DIDDoc, connection: Connection): Promise<void>

  //Connection Records

  _addConnectionRecord(connection: Connection): Promise<Connection>

  updateConnectionRecord(
    connectionID: ConnectionID,
    connectionUpdates: {},
  ): Promise<Connection>

  getConnectionRecord(connectionID: ConnectionID): Promise<Connection>

  searchConnectionRecords(recipientKeys: string[]): Promise<StorageRecord[]>

  // deleteConnection():Promise<void>

  _broadcastConnectionRecord(connection: Connection): Promise<void>

  // sendConnectionResponse():Promise<void>
}

export interface ConnectionsAdminAPIInterface {
  /**
   * Process and store an invitation
   * @param invitationURL The URL of the invitation
   * @param role The connection role the invitation will generate
   * @returns A promise of an Invitation Record
   */
  receiveInvitation(
    invitationURL: string,
    role: ConnectionRoles,
  ): Promise<InvitationRecord>

  /**
   * Accept a stored invitation and create a connection, and add keys to be mediated if the role added in the invitation requires mediation
   * @param invitationID The Invitation ID of the invite to accept
   * @param label The label to provide to the other agent
   * @param mediatorID The optional (dependent on role) mediator ID to use for mediation
   * @returns A promise of the created Connection ID of the connection
   */
  acceptInvitation(
    invitationID: InvitationID,
    label: string,
    mediatorID: string | null,
  ): Promise<ConnectionID>
}
