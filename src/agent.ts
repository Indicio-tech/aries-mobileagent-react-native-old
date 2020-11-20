import {Record, Literal, Static, String, Union} from 'runtypes'

import {UUID} from './types/uuid'
import * as AgentErrors from './errors'


const MediatorConfig = Record({
    invite: String,
    publicKey: String,
    endpoint: String
})
export type MediatorConfig = Static<typeof MediatorConfig>


const LedgerConfig = Record({
    name: String
})
export type LedgerConfig = Static<typeof LedgerConfig>


const StorageType = Union(
    Literal('LibIndyNonSecrets'),
    //Literal('CouchDB')
)
export type StorageType = Static<typeof StorageType>


const WalletName = String
export type WalletName = Static<typeof WalletName>



export interface AgentInterface {
}

export class Agent implements AgentInterface {
    #walletName:WalletName
    #storageType:StorageType
    #ledgerConfig:LedgerConfig
    #mediatorConfig:MediatorConfig
    #walletPassword:string
	constructor(builder:AgentBuilder) {
        console.log("Creating Agent")

        //Validate non-optional Builder arguments
        console.log("Validating Arguments")
        if(!LedgerConfig.guard(builder._ledgerConfig)){
            throw new AgentErrors.ValidationError("ledgerConfig")
        }
        if(!WalletName.guard(builder._walletName)){
            throw new AgentErrors.ValidationError("walletName")
        }
        if(!StorageType.guard(builder._storageType)){
            throw new AgentErrors.ValidationError("storageType")
        }
        if(!MediatorConfig.guard(builder._mediatorConfig)){
            throw new AgentErrors.ValidationError("mediatorConfig")
        }

        this.#walletName = builder._walletName
        this.#storageType = builder._storageType
        this.#ledgerConfig = builder._ledgerConfig
        this.#mediatorConfig = builder._mediatorConfig
        this.#walletPassword = "3446";
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




export interface AgentBuilderInterface {
    setWalletName(walletName:WalletName):AgentBuilder,
    setStorageType(storageType:StorageType):AgentBuilder,
    setLedgerConfig(ledgerConfig:LedgerConfig):AgentBuilder,
    setMediatorConfig(mediatorConfig:MediatorConfig):AgentBuilder,
    build():Agent
}

/**
 * Agent Builder - A Builder Class to create an Agent
 * @interface AgentBuilderInterface
 */
export default class AgentBuilder implements AgentBuilderInterface {
    _walletName:WalletName | null = null
    _storageType:StorageType | null = null
    _ledgerConfig:LedgerConfig | null = null
    _mediatorConfig:MediatorConfig | null = null
    _walletPassword:string | null = null
    
    /**
     * Agent Builder - An instance of a Agent Builder Class to create an Agent
     * @interface AgentBuilderInterface
     */
    constructor() {}


    /**
     * Sets the name of the Agent's wallet (Suggested to use a UUID)
     * @param walletName Name of the wallet 
     * @returns AgentBuilder
     */
    setWalletName(walletName:WalletName):AgentBuilder {
        //Validation
        try{
            WalletName.check(walletName)
        } catch(e){
            throw new AgentErrors.ValidationError("walletName", e.message)
        }

        this._walletName = walletName
        return this
    }


    /**
     * Sets the storage type of the Agent's wallet
     * @param storageType The type of storage implementation
     * @returns AgentBuilder
     */
    setStorageType(storageType:StorageType):AgentBuilder {
        //Validation
        try{
            StorageType.check(storageType)
        } catch(e){
            throw new AgentErrors.ValidationError("storageType", e.message)
        }
        
        this._storageType = storageType
        return this
    }
    

    /**
     * Sets the ledger configuration of the Agent
     * @param ledgerConfig A ledger configuration
     * @returns AgentBuilder
     */
    setLedgerConfig(ledgerConfig:LedgerConfig):AgentBuilder {
        //Validation
        try{
            LedgerConfig.check(ledgerConfig)
        } catch(e){
            throw new AgentErrors.ValidationError("ledgerConfig", e.message)
        }
        
        this._ledgerConfig = ledgerConfig
        return this
    }


    /**
     * Sets the mediator configuration of the Agent
     * @param mediatorConfig A mediator configuration
     * @returns AgentBuilder
     */
    setMediatorConfig(mediatorConfig:MediatorConfig):AgentBuilder {
        //Validation
        try{
            MediatorConfig.check(mediatorConfig)
        } catch(e){
            throw new AgentErrors.ValidationError("mediatorConfig", e.message)
        }
        
        this._mediatorConfig = mediatorConfig
        return this
    }


    /**
     * Builds the Agent and returns the generated Agent instance
     * @returns Agent
     */
    build() {
        return new Agent(this)
    }
}


export interface DefaultAgentDirectorInterface {
}

export class DefaultAgentDirector implements DefaultAgentDirectorInterface {
    constructor() {
        console.log("Creating Default Agent");

	}
}