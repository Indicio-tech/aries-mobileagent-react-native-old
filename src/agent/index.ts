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



export const AgentConfig = Record({
    walletName:WalletName,
    walletPassword:WalletPassword,
    mediatorConfig:MediatorConfig.Or(Undefined),
    ledgerConfig:LedgerConfig
})
export type AgentConfig = Static<typeof AgentConfig>




export interface AgentManagerInterface {
    created(
        walletService:WalletServiceInterface, 
        storageService:StorageServiceInterface
    ):boolean,
    createAgent(
        walletService:WalletServiceInterface, 
        storageService:StorageServiceInterface, 
        creationParameters:AgentConfig
    ):void,
    loadAgent(
        walletService:WalletServiceInterface, 
        storageService:StorageServiceInterface
    ):agent
}

class AgentManager implements AgentManagerInterface {
    constructor(){
        console.info("Creating Agent Manager");
    }

    created(walletService:WalletServiceInterface, storageService:StorageServiceInterface):boolean {
        console.info("Checking if Agent has been created")


    }

    createAgent(
        walletService:WalletServiceInterface, 
        storageService:StorageServiceInterface,
        creationParameters:AgentConfig
        ):void {
        console.info("Creating Agent");
        console.log(creationParameters)
    }

    loadAgent():agent{

    }
}

export default new AgentManager()