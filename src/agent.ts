import * as AgentErrors from './errors'

export interface MediatorConfig {
    invite: string,
    publicKey: string,
    endpoint: string
}

export interface LedgerConfig {
    name: string
}
function isLedgerConfig(param:any): param is LedgerConfig {
    if(typeof param.name === "string"){
        return false
    }
    return true
}


export enum StorageType {
    LibIndyNonSecrets = "LibIndyNonSecrets",
    //CouchDB = "CouchDB"
}
type StorageTypeStrings = keyof typeof StorageType
function isStorageType(param:any): param is StorageType {
    return param in StorageType
}
function isStorageTypeGuard(param:any){
    if(!isStorageType(param)){
        throw new AgentErrors.InvalidParameter(Object.keys(param).toString(), param)
    }
}


function isString(param:any): param is string {
    return typeof param === 'string'
}
function isStringGuard(param:any){
    if(!isString(param)){
        throw new AgentErrors.TypeError("string", typeof param)
    }
}


export interface AgentInterface {
    walletName:string,
    // storageType:storageType,
    // ledgerConfig:LedgerConfig,
    // mediatorConfig:MediatorConfig,
}

export class Agent implements AgentInterface {
    walletName:string
    // storageType:storageType
    // ledgerConfig:LedgerConfig
    // mediatorConfig:MediatorConfig
    #walletPassword:string
	constructor(builder:AgentBuilder) {
        console.log("Creating Agent")

        //Validate Builder Arguments
        console.log("Validating Arguments")
        if(!isString(builder._walletName)){
            throw new AgentErrors.TypeError("string", typeof builder._walletName)
        }

        this.walletName = builder._walletName
        // this.storageType = builder._storageType
        // this.ledgerConfig = builder._ledgerConfig
        // this.mediatorConfig = builder._mediatorConfig
        this.#walletPassword = "3446";
	}
}


export interface AgentBuilderInterface {
    setWalletName(walletName:string):AgentBuilder,
    setStorageConfig(storageType:StorageTypeStrings):AgentBuilder,
}

//Agent Builder Constructor
export default class AgentBuilder implements AgentBuilderInterface {
    _walletName:string | null = null
    _storageType:StorageTypeStrings | null = null
    _ledgerConfig:LedgerConfig | null = null
    _mediatorConfig:MediatorConfig | null = null
    _walletPassword:string | null = null

    constructor() {}

    setWalletName(walletName:string):AgentBuilder {
        isStringGuard(walletName)

        this._walletName = walletName
        return this
    }

    setStorageConfig(storageType:StorageTypeStrings):AgentBuilder {
        isStringGuard(storageType)
        isStorageTypeGuard(storageType)
        
        this._storageType = storageType
        return this
    }

    setLedgerConfig(ledgerConfig:LedgerConfig):AgentBuilder {
        console.log(ledgerConfig)
        console.log(ledgerConfig)
        // if(!isLedgerConfig(ledgerConfig))
        // {
        //     throw new AgentErrors.TypeError("string", typeof storageType)
        // }
        
        // this._storageType = storageType
        return this
    }

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