import ConnectionsService from '../connections/connectionsService'

import MediationServiceInterface, { MediatorInvite, MediatorEndpoint, MediatorPublicKey} from './mediatorServiceInterface'

export default class MediationService implements MediationServiceInterface {
    #connectionsService:ConnectionsService
    
    constructor(connectionsService:ConnectionsService){
        console.info("Mediation Service Created")

        this.#connectionsService = connectionsService
    }



    async addMediator(invite:MediatorInvite, endpoint:MediatorEndpoint, publicKey:MediatorPublicKey):Promise<void> {
        console.info(`Adding New Mediator at endpoint ${endpoint}`)


    }
}