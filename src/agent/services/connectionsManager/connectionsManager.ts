//Storage Dependencies
import StorageServiceInterface from '../../../storage'

//Wallet Dependencies
import WalletServiceInterface from '../../../wallet'

import ConnectionsHandlerInterface from '../../protocols/connections/connectionsInterface'

import ConnectionsManagerInterface from './connectionsManagerInterface'

export default class ConnectionsManager implements ConnectionsManagerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    
    #connectionsHandler!:ConnectionsHandlerInterface
    
    constructor(
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface
    ){
        console.info("ConnectionsManager created")

        this.#walletService = walletService
        this.#storageService = storageService
    }

    registerProtocolHandlers(connections:ConnectionsHandlerInterface):void{
        this.#connectionsHandler = connections
        console.info("Protocols Registered in ConnectionsManager Service")
    }
}

