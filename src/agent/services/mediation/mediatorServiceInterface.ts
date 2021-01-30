import {Static, Record, String, Literal, Array, Union} from 'runtypes'
import { URLType } from '../../../utils/types'

export const MediationStatus = Union(
    Literal("not-mediating"), 
    Literal("requested"),
    Literal("mediating"),
    Literal("denied"),
)
export type MediationStatus = Static<typeof MediationStatus>

export const MediationDetails = Record({
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