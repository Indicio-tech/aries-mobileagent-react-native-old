import { Static, Record, String, Array, Literal, Union, Undefined, Number } from 'runtypes'
import { URLType } from '../../../utils/types'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const DID = String
export type DID = Static<typeof DID>

export const DIDKeyReference = String
export type DIDKeyReference = Static<typeof DIDKeyReference>

export const DIDWithType = String
export type DIDWithType = Static<typeof DIDWithType>

export const Verkey = String
export type Verkey = Static<typeof Verkey>

export const PublicKey = Record({
    id: DIDKeyReference,
    type: Literal('Ed25519VerificationKey2018'),
    controller: DID,
    publicKeyBase58: Verkey
})
export type PublicKey = Static<typeof PublicKey>

export const AuthenticationMethod = Record({
    type: Literal('Ed25519VerificationKey2018'),
    publicKey: DIDKeyReference
})
export type AuthenticationMethod = Static<typeof AuthenticationMethod>

export const Service = Record({
    id: DIDWithType,
    type: Union(Literal("did-communication")).Or(Undefined),
    priority: Number,
    recipientKeys: Array(Verkey), //JamesKEbert TODO: Replace with DID Key references: //Array(DIDKeyReference),
    routingKeys: Array(Verkey), //JamesKEbert TODO: Replace with DID Key references: //Array(DIDKeyReference),
    serviceEndpoint: URLType //JamesKEbert TODO: Add DID endpoint support
})
export type Service = Static<typeof Service>

export const DIDDoc = Record({
    "@context":String,
    id:DID,
    publicKey: Array(PublicKey),
    authentication: Array(AuthenticationMethod),
    service: Array(Service)
})
export type DIDDoc = Static<typeof DIDDoc>

export default interface DIDServiceInterface {
    
}