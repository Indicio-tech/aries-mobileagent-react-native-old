import {Static, Record, String, Literal, Array, Union} from 'runtypes'
import { URLType, UUID } from '../../../utils/types'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MediatorID = UUID
export type MediatorID = Static<typeof MediatorID>

export const MediationStatus = Union(
    Literal("not-mediating"), 
    Literal("requested"),
    Literal("mediating"),
    Literal("denied"),
)
export type MediationStatus = Static<typeof MediationStatus>

export const MediationStates = Union(
    Literal("keylist-update-sent"), 
    Literal("keylist-update-responded"), 
)
export type MediationStates = Static<typeof MediationStates>

export const MediationDetails = Record({
   // mediator
    status: MediationStatus,
    endpoint: URLType,
    routingKeys: Array(String)
})
export type MediationDetails = Static<typeof MediationDetails>

export const MediatorInvite = String
export type MediatorInvite = Static<typeof MediatorInvite>

export const MediatorPublicKey = String
export type MediatorPublicKey = Static<typeof MediatorPublicKey>

export const MediatorEndpoint = String
export type MediatorEndpoint = Static<typeof MediatorEndpoint>

export default interface MediationServiceInterface {
    addMediator(invite:MediatorInvite, endpoint:MediatorEndpoint, publicKey:MediatorPublicKey):Promise<void>
}