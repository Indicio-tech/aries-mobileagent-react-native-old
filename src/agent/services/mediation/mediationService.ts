import ConnectionsService from '../connections/connectionsService'

//Storage Dependencies
import StorageServiceInterface from '../../../storage'

import MediationServiceInterface, { WalletName, WalletPassword, MediatorInvite, MediatorEndpoint, MediatorPublicKey} from './mediatorServiceInterface'

export default class MediationService implements MediationServiceInterface {
    #connectionsService!:ConnectionsService
    #storageService:StorageServiceInterface

    #walletName:WalletName
    #walletPassword:WalletPassword

    constructor(
        storageService:StorageServiceInterface,
        walletName:WalletName,
        walletPassword:WalletPassword,
    ){
        console.info("Mediation Service Created")
        this.#walletName = walletName
        this.#walletPassword = walletPassword
        this.#storageService = storageService
    }   
       
    registerDependencies(connectionsService:ConnectionsService):void {
        this.#connectionsService = connectionsService
        console.info("Dependencies Registered in Mediation Service")
    }

    async addMediator(invite:MediatorInvite, endpoint:MediatorEndpoint, publicKey:MediatorPublicKey):Promise<void> {
        console.info(`Adding New Mediator at endpoint ${endpoint}`)


    }
}