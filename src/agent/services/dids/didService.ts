//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

import DIDServiceInterface, {WalletName, WalletPassword, DIDKeyPair, DIDDoc, ServiceEndpoint, Verkey} from './didServiceInterface'

export default class DIDService implements DIDServiceInterface {
    #walletService:WalletServiceInterface

    #walletName:WalletName
    #walletPassword:WalletPassword

    constructor(
        walletService:WalletServiceInterface,
        walletName:WalletName,
        walletPassword:WalletPassword,
    ){
        console.info("Creating DIDManager")

        this.#walletService = walletService
        this.#walletName = walletName
        this.#walletPassword = walletPassword
    }

    async createNewDID():Promise<DIDKeyPair> {
        return await this.#walletService.createDID(this.#walletName, this.#walletPassword)
    }

    async createDIDDoc(didKeyPair:DIDKeyPair, serviceEndpoint:ServiceEndpoint = "", routingKeys:Verkey[] = []):Promise<DIDDoc> {
        console.info("Creating DIDDoc")

        const didDOC:DIDDoc = {
            "@context": "https://w3id.org/did/v1",
            id: didKeyPair.did,
            publicKey: [
                {
                    id: `${didKeyPair.did}#1`,
                    type: 'Ed25519VerificationKey2018',
                    controller: didKeyPair.did,
                    publicKeyBase58: didKeyPair.key,
                  },
            ],
            authentication: [
                {
                    publicKey: `${didKeyPair.did}#1`,
                    type: "Ed25519VerificationKey2018"
                }
            ],
            service: [
                {
                    id: `${didKeyPair.did}#did-communication`,
                    type: "did-communication",
                    priority: 0,
                    recipientKeys: [
                        didKeyPair.key //JamesKEbert TODO: Make a did key reference
                    ],
                    routingKeys: routingKeys,
                    serviceEndpoint: serviceEndpoint
                }
            ]
        }

        console.info("Generated DIDDoc:", didDOC)

        return didDOC
    }
}