import {Static, Record, String, Literal, Array, Union} from 'runtypes'
import { URLType } from '../../utils/types'

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