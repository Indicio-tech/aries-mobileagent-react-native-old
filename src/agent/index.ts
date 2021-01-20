import {Record, Static, String, Undefined} from 'runtypes'

import * as AgentErrors from '../errors'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'


//Agent Types
export const WalletName = String
export type WalletName = Static<typeof WalletName>


export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>


export const MediatorConfig = Record({
    invite: String,
    publicKey: String,
    endpoint: String
})
export type MediatorConfig = Static<typeof MediatorConfig>


export const LedgerConfig = Record({
    name: String
})
export type LedgerConfig = Static<typeof LedgerConfig>



export const AgentConfigRecord = Record({
    walletName:WalletName,
    walletPassword:WalletPassword,
    ledgerConfig:LedgerConfig,
    mediatorConfig:MediatorConfig.Or(Undefined)
})
export type AgentConfig = Static<typeof AgentConfigRecord>




export interface AgentManagerInterface {
    created():boolean,
    createAgent(creationParameters:AgentConfig):void,
    loadAgent():any
}

export default class AgentManager implements AgentManagerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface

    constructor(walletService:WalletServiceInterface, storageService:StorageServiceInterface){
        console.info("Creating Agent Manager");

        this.#walletService = walletService
        this.#storageService = storageService
    }

    /**
     * Checks to identify if the agent has been created
     * @returns boolean - Returns a true if configuration has occurred, false if configuration has not occurred
     * @throws Error - AgentErrors.Error - Thrown if there is an error while checking the configuration
     */
    created():boolean {
        console.info("Checking AMA-RN Agent created state")

        return false
    }

    /**
     * Creates the agent via the provided configuration
     * @returns void
     * @throws Error - AgentErrors.Error - Thrown if there is an error while creating the agent
     */
    createAgent(creationParameters:AgentConfig):void {
        console.info("Creating Agent");
        console.log(creationParameters)

        console.log(AgentConfigRecord.guard(creationParameters))
        console.log(AgentConfigRecord.check(creationParameters))
    }

    /**
     * Loads the agent
     * @returns agent - an agent object
     * @throws Error - AgentErrors.Error - Thrown if there is an error while loading the agent
     */
    loadAgent(){
        console.info("Loading Agent")

    }
}