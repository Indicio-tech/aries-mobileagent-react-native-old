//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

import DIDServiceInterface, {WalletName, WalletPassword, DID, DIDDoc} from './didServiceInterface'

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

    async createNewDID():Promise<DID> {
        console.info("Creating New DID")


    }

    async createDIDDoc(did:DID):Promise<DIDDoc> {

    }
}