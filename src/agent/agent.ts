import {Record, Literal, Static, String, Union} from 'runtypes'

import {UUID} from '../types/uuid'

import * as AgentErrors from '../errors'
import AgentBuilder from './agentBuilder'

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


export const StorageType = Union(
    Literal('LibIndyNonSecrets'),
    //Literal('CouchDB')
)
export type StorageType = Static<typeof StorageType>


export const WalletName = String
export type WalletName = Static<typeof WalletName>



export interface AgentInterface {
    getWalletName():WalletName
}

export class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:string
    #storageType:StorageType
    #ledgerConfig:LedgerConfig | null = null
    #mediatorConfig:MediatorConfig | null = null

	constructor(builder:AgentBuilder) {
        console.log("Constructing Agent")

        
        //Validate non-optional Builder arguments
        console.log("Validating Builder Arguments")

        if(!WalletName.guard(builder._walletName)){
            throw new AgentErrors.ValidationError("walletName")
        }
        if(!LedgerConfig.guard(builder._ledgerConfig)){
            throw new AgentErrors.ValidationError("ledgerConfig")
        }
        if(!StorageType.guard(builder._storageType)){
            throw new AgentErrors.ValidationError("storageType")
        }
        if(!MediatorConfig.guard(builder._mediatorConfig)){
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