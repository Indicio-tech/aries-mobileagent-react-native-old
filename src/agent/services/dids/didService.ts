import url from 'url'

//Wallet Dependencies
import WalletService from '../../../wallet/indy'

import DIDServiceInterface, {
  DIDKeyPair,
  DIDDoc,
  ServiceEndpoint,
  Verkey,
  Service,
} from './didServiceInterface'

class DIDService implements DIDServiceInterface {
  constructor() {
    console.info('Creating DIDManager')
  }

  async createNewDID(): Promise<DIDKeyPair> {
    return await WalletService.createDID()
  }

  async createDIDDoc(
    didKeyPair: DIDKeyPair,
    serviceEndpoint: ServiceEndpoint = '',
    routingKeys: Verkey[] = [],
  ): Promise<DIDDoc> {
    console.info('Creating DIDDoc')

    const didDoc: DIDDoc = {
      '@context': 'https://w3id.org/did/v1',
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
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      service: [
        {
          id: `${didKeyPair.did}#did-communication`,
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: [
            didKeyPair.key, //JamesKEbert TODO: Make a did key reference
          ],
          routingKeys: routingKeys,
          serviceEndpoint: serviceEndpoint,
        },
      ],
    }

    console.info('Generated DIDDoc:', didDoc)

    return didDoc
  }

  async retrieveDIDDocService(didDoc: DIDDoc): Promise<Service> {
    let selectedService = didDoc.service[0]
    for (var i = 0; i < didDoc.service.length; i++) {
      let potentialService = didDoc.service[i]
      let potentialServiceTransport = url.parse(
        potentialService.serviceEndpoint,
      )

      if (potentialService.priority < selectedService.priority) {
        selectedService = potentialService
      } else if (
        potentialService.priority === selectedService.priority &&
        (potentialServiceTransport.protocol === 'ws:' ||
          potentialServiceTransport.protocol === 'wss:')
      ) {
        selectedService = potentialService
      }
    }

    return selectedService
  }
}

export default new DIDService()
