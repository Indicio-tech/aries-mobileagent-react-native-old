import {Static, Record, String, Literal, Array, Union, Null} from 'runtypes'
import { URLType, UUID } from '../../../utils/types'
import { StorageRecord } from '../../../wallet'
import { Connection, ConnectionID } from '../connections/connectionsServiceInterface'

export const KeylistUpdate = Record({
    recipient_key: String,
    action: Union(Literal("add"), Literal("remove"))
})
export type KeylistUpdate = Static<typeof KeylistUpdate>

export const KeylistUpdateResults = Record({
    recipient_key: String,
    action: Union(Literal("add"), Literal("remove")),
    result: Union(Literal("client_error"), Literal("server_error"), Literal("no_change"), Literal("success"),)
})
export type KeylistUpdateResults = Static<typeof KeylistUpdateResults>

export const MediatorID = String
export type MediatorID = Static<typeof MediatorID>

export const MediatorInvite = String
export type MediatorInvite = Static<typeof MediatorInvite>

export const MediationStates = Union(
    Literal("connecting"),
    Literal("requested-mediation"),
    Literal("mediation-granted"),

    Literal("mediation-denied"),
)
export type MediationStates = Static<typeof MediationStates>


export const MediatorRecord = Record({
    state: MediationStates,
    connectionID: ConnectionID,
    mediatorID: MediatorID,
    endpoint: URLType,
    routingKeys: Array(String)
})
export type MediatorRecord = Static<typeof MediatorRecord>

export default interface MediationServiceInterface {
    addMediator(invite:MediatorInvite, mediatorID:MediatorID):Promise<void> 

    requestMediation(connection:Connection):Promise<void>
    mediationGranted(connection:Connection, endpoint:URLType, routingKeys:string[]):Promise<void>

    _addMediatorRecord(mediatorRecord:MediatorRecord, tags:{}):Promise<void>
    getMediatorRecord(mediatorID:MediatorID):Promise<MediatorRecord>
    searchMediatorRecords(endpoint:string):Promise<StorageRecord[]>
    updateMediationRecord(
        mediatorID:MediatorID,
        mediatorUpdates:{}
    ):Promise<MediatorRecord>
    _broadcastMediationRecord(mediatorRecord:MediatorRecord):Promise<void>
}

export interface MediationAdminAPIInterface {
    addMediator(invite:MediatorInvite, mediatorID:MediatorID):Promise<void>
}