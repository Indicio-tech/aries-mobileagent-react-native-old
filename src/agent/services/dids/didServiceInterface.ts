import {
  Static,
  Record,
  String,
  Array,
  Literal,
  Union,
  Undefined,
  Number,
  Partial,
} from 'runtypes'
import {URLType} from '../../../utils/types'

export const DID = String //Such as: did:method:QUmsj7xwB82QAuuzfmvhAi
export type DID = Static<typeof DID>

//Such as: did:method:QUmsj7xwB82QAuuzfmvhAi#1
//or: did:method:QUmsj7xwB82QAuuzfmvhAi#did-communciation
export const DIDKeyReference = String
export type DIDKeyReference = Static<typeof DIDKeyReference>

export const Verkey = String
export type Verkey = Static<typeof Verkey>

export const DIDKeyPair = Record({
  did: DID,
  key: Verkey,
})
export type DIDKeyPair = Static<typeof DIDKeyPair>

export const PublicKey = Record({
  id: DIDKeyReference,
  type: Literal('Ed25519VerificationKey2018'),
  controller: DID,
  publicKeyBase58: Verkey,
})
export type PublicKey = Static<typeof PublicKey>

export const AuthenticationMethod = Record({
  type: Literal('Ed25519SignatureAuthentication2018'),
  publicKey: DIDKeyReference,
})
export type AuthenticationMethod = Static<typeof AuthenticationMethod>

export const ServiceEndpoint = URLType
export type ServiceEndpoint = Static<typeof ServiceEndpoint>

export const Service = Record({
  id: DIDKeyReference,
  priority: Number,
  recipientKeys: Array(Verkey), //JamesKEbert TODO: Replace with DID Key references: //Array(DIDKeyReference),
  serviceEndpoint: ServiceEndpoint, //JamesKEbert TODO: Add DID endpoint support
}).And(
  Partial({
    routingKeys: Array(Verkey), //JamesKEbert TODO: Replace with DID Key references: //Array(DIDKeyReference),
    type: Union(Literal('did-communication'), Literal('IndyAgent')),
  }),
)
export type Service = Static<typeof Service>

export const DIDDoc = Record({
  '@context': String,
  id: DID,
  publicKey: Array(PublicKey),
  authentication: Array(AuthenticationMethod),
  service: Array(Service),
})
export type DIDDoc = Static<typeof DIDDoc>

export default interface DIDServiceInterface {
  /**
   * Create a new DID Key Pair
   * @returns a DID Key Pair
   */
  createNewDID(): Promise<DIDKeyPair>

  /**
   * Creates a DIDDoc
   * @param didKeyPair A DID Key Pair
   * @param serviceEndpoint The Agent service endpoint
   * @param routingKeys The routing keys to communicate with the agent
   * @returns a promise of a DIDDoc
   */
  createDIDDoc(
    didKeyPair: DIDKeyPair,
    serviceEndpoint: ServiceEndpoint,
    routingKeys: Verkey[],
  ): Promise<DIDDoc>

  /**
   * Parse a DIDDoc and return the highest priority service by priorities listed, secondarily by the websocket protocol
   * @param didDoc A DIDDoc
   * @returns The preferred service for the DIDDoc
   */
  retrieveDIDDocService(didDoc: DIDDoc): Promise<Service>
}
