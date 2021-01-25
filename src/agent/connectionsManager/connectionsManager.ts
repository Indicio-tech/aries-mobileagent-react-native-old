//Storage Dependencies
import StorageServiceInterface from '../../storage'

//Wallet Dependencies
import WalletServiceInterface from '../../wallet'

import ConnectionsManagerInterface from './connectionsManagerInterface'

export default class ConnectionsManager implements ConnectionsManagerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    
    constructor(
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface
    ){
        console.info("ConnectionsManager created")

        this.#walletService = walletService
        this.#storageService = storageService
    }
}