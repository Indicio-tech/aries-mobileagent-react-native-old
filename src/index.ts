import {Static, Literal, Union} from 'runtypes'

//For UUIDv4 within React Native
import 'react-native-get-random-values'
//For Global Buffer usage
global.Buffer = global.Buffer || require('buffer').Buffer

//Errors
import * as AgentErrors from './errors'


//Wallet Dependencies
import WalletServiceInterface from './wallet'
import IndyService from './wallet/indy'

//Default AMA-RN loaded Wallet Services
export const WalletType = Union(
    Literal('Indy')
)
export type WalletType = Static<typeof WalletType>


//Storage Dependencies
import StorageServiceInterface from './storage'
import LibIndyStorageService from './storage/libIndy'

//Default AMA-RN loaded Storage Services
export const StorageType = Union(
    Literal('LibIndyNonSecrets')
)
export type StorageType = Static<typeof StorageType>



/*
Library Layout
Agent Creation
    Builder Pattern
    Uses Wallet and Storage Services
    create() Sets Agent Configuration via storage
Agent Load
    Function Call, pass storage and wallet info directly
    function authenticates
    function loads agent config
    Creates an Agent Class instance
    Agent performs startup actions
        First time actions (mediation, governance)
        Routine actions
*/

//import {AgentBuilder, AgentLoader, AgentDirector} from './agent'

import AgentManager, {AgentManagerInterface} from './agent'

interface AMARNInterface {
    agentManager:AgentManager
}

/**
 * To initialize AMA-RN and manage its dependencies
 */
export default class AMARN implements AMARNInterface {
    #walletService!:WalletServiceInterface
    #storageService!:StorageServiceInterface
    
    //Manages creation and loading of the agent
    agentManager:AgentManager

    
    constructor(walletService:WalletType, storageService:StorageType){
        try{
            console.info(`Loading AMA-RN`)
            this._setWallet(walletService)
            this._setStorage(storageService)
            this.agentManager = new AgentManager(this.getWallet(), this.getStorage())
            //this.getWallet().createWallet
            this.checkDependencies()
        }
        catch(error) {
            throw new AgentErrors.Error(0, "Failed to Start AMARN");
        }
    }

    /**
     * Creates and sets the Wallet Service. Validates the WalletType passed and stores the generated service
     * @param walletService The type of wallet service. Must be a WalletType
     * @returns void
     * @throws ValidationError - AgentErrors.ValidationError
     * @throws Error - AgentErrors.Error
     */
    _setWallet(walletService:WalletType):void {
        //(JamesKEbert)TODO: Add the capability to pass an external service for dependency injection
        console.info(`Setting Wallet Service of type ${walletService}`)

        if(!WalletType.guard(walletService)){
            throw new AgentErrors.ValidationError("walletService")
        }
    
        switch (walletService) {
            case 'Indy':
                this.#walletService = new IndyService()
                break
            default:
                throw new AgentErrors.Error(0, "Unidentified Wallet Service")
        }

        console.info(`Wallet Service Set`)
    }

    /**
     * Fetches the created Wallet Service after validating that the service has been created
     * @returns WalletServiceInterface - An instance of a Wallet Service
     * @throws Error - AgentErrors.Error
     */
    getWallet():WalletServiceInterface{
        if(!this.#walletService){
            throw new AgentErrors.Error(0, "Wallet Service has not been set")
        }
        return this.#walletService
    }


    /**
     * Creates and sets the Storage Service. Validates the StorageType passed and stores the generated service
     * @param storageService The type of wallet service. Must be a StorageType
     * @returns void
     * @throws ValidationError - AgentErrors.ValidationError
     * @throws Error - AgentErrors.Error
     */
    _setStorage(storageService:StorageType){
        //(JamesKEbert)TODO: Add the capability to pass an external service for dependency injection
        console.info(`Setting Storage Service of type ${storageService}`)

        if(!StorageType.guard(storageService)){
            throw new AgentErrors.ValidationError("storageService")
        }
    
        switch (storageService) {
            case 'LibIndyNonSecrets':
                if(this.getWallet().walletServiceType === "Indy"){
                    this.#storageService = new LibIndyStorageService(this.getWallet())
                }
                else{
                    throw new AgentErrors.Error(0, "LibIndyNonSecrets Storage requires the Indy Wallet Service to be used")
                }
                break
            default:
                throw new AgentErrors.Error(0, "Unidentified Wallet Service")
        }

        console.info(`Storage Service Set`)
    }

    /**
     * Fetches the created Storage Service after validating that the service has been created
     * @returns StorageServiceInterface - An instance of a Storage Service
     * @throws Error - AgentErrors.Error
     */
    getStorage():StorageServiceInterface{
        if(!this.#storageService){
            throw new AgentErrors.Error(0, "Storage Service has not been set")
        }
        return this.#storageService
    }


    /**
     * Checks to identify if all AMA-RN dependencies have been set
     * @returns boolean - Returns true upon successful dependency validation
     * @throws Error - AgentErrors.Error - Thrown when a dependency has not been set
     */
    checkDependencies():boolean{
        console.info(`Checking Dependencies`)
        if(!this.#storageService){
            throw new AgentErrors.Error(0, "Storage Service has not been set")
        }
        if(!this.#walletService){
            throw new AgentErrors.Error(0, "Wallet Service has not been set")
        }
        //Add additional dependencies here

        return true
    }
}