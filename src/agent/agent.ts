import {Record, Static, String, Undefined} from 'runtypes'

import {UUID} from '../types/uuid'
import {StorageType} from '../walletInterface'

import * as AgentErrors from '../errors'
import AgentBuilder from './agentBuilder'


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
    storageType:StorageType,
    mediatorConfig:MediatorConfig.Or(Undefined),
    ledgerConfig:LedgerConfig.Or(Undefined)
})
export type AgentConfig = Static<typeof AgentConfig>




export interface AgentInterface {
    getWalletName():WalletName
}

export default class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:WalletPassword
    #storageType:StorageType
    #ledgerConfig:LedgerConfig | null = null
    #mediatorConfig:MediatorConfig | null = null

	constructor(builder:AgentBuilder) {
        console.log("Constructing Agent")

        
        console.log("Validating Builder Arguments")

        //Validate non-optional Builder arguments
        if(!WalletName.guard(builder._walletName)){
            throw new AgentErrors.ValidationError("walletName")
        }
        if(!WalletPassword.guard(builder._walletPassword)){
            throw new AgentErrors.ValidationError("walletPassword")
        }
        if(!StorageType.guard(builder._storageType)){
            throw new AgentErrors.ValidationError("storageType")
        }

        //Validate optional Builder Arguments
        if(!LedgerConfig.guard(builder._ledgerConfig) && typeof builder._ledgerConfig !== 'undefined'){
            throw new AgentErrors.ValidationError("ledgerConfig")
        }
        if(!MediatorConfig.guard(builder._mediatorConfig) && typeof builder._mediatorConfig !== 'undefined'){
            throw new AgentErrors.ValidationError("mediatorConfig")
        }


        this.#walletName = builder._walletName
        this.#walletPassword = "3446";
        this.#storageType = builder._storageType
        this.#ledgerConfig = builder._ledgerConfig
        this.#mediatorConfig = builder._mediatorConfig

        
        //Authenticate Wallet



        //Open Wallet
    }
    


    /**
     * Gets the Agent's wallet name
     * @returns WalletName
     */
    getWalletName():WalletName{
        return this.#walletName
    }
    

    /**
     * Gets the Agent's storage type
     * @returns StorageType
     */
    getStorageType():StorageType{
        return this.#storageType
    }
}