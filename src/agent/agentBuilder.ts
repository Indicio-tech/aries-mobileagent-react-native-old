import * as AgentErrors from '../errors'
import Agent, {AgentConfig, WalletName, WalletPassword, LedgerConfig, MediatorConfig } from './agent'
import createWalletService, {WalletServiceInterface, WalletType} from '../wallet'


export interface AgentBuilderInterface {
    setWalletName(walletName:WalletName):AgentBuilder,
    setWalletPassword(walletPassword:WalletPassword):AgentBuilder,
    setStorageType(storageType:StorageType):AgentBuilder,
    setLedgerConfig(ledgerConfig:LedgerConfig):AgentBuilder,
    setMediatorConfig(mediatorConfig:MediatorConfig):AgentBuilder,
    create():Promise<Agent>
}

/**
 * Agent Builder - A Builder Class to create an Agent
 * @interface AgentBuilderInterface
 */
export default class AgentBuilder implements AgentBuilderInterface {
    _walletService!:WalletServiceInterface
    _walletName!:WalletName
    _walletPassword!:WalletPassword
    _storageType!:StorageType
    _ledgerConfig!:LedgerConfig
    _mediatorConfig!:MediatorConfig
    
    /**
     * Agent Builder - An instance of an Agent Builder Class to create an Agent
     * @interface AgentBuilderInterface
     */
    constructor() {
        console.log("Building Agent")
    }


    /**
     * Creates the wallet service to be used by the Agent
     * @param walletService The type of wallet service. Must be a WalletType
     * @returns AgentBuilder
     * @throws ValidationError - AgentErrors.ValidationError
     */
    setWalletService(walletService:WalletType):AgentBuilder {
        try{
            this._walletService = createWalletService(walletService)

            return this
        } catch(e){
            throw new AgentErrors.Error(0, "Failed to Create Wallet Service");
        }
    }


    /**
     * Sets the name of the Agent's wallet (Suggested to use a UUID)
     * @param walletName Name of the wallet 
     * @returns AgentBuilder
     * @throws ValidationError - AgentErrors.ValidationError
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


    //(JamesKEbert)TODO: Define the minimum password requirements
    /**
     * Sets the password of the Agent's wallet 
     * @param walletPassword Password of the wallet 
     * @returns AgentBuilder
     * @throws ValidationError - AgentErrors.ValidationError
     */
    setWalletPassword(walletPassword:WalletPassword):AgentBuilder {
        //Validation
        try{
            WalletPassword.check(walletPassword)
        } catch(e){
            throw new AgentErrors.ValidationError("walletPassword", e.message)
        }

        this._walletPassword = walletPassword
        return this
    }


    /**
     * Sets the storage type of the Agent's wallet
     * @param storageType The type of storage implementation
     * @returns AgentBuilder
     * @throws ValidationError - AgentErrors.ValidationError
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
     * @throws ValidationError - AgentErrors.ValidationError
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
     * @throws ValidationError - AgentErrors.ValidationError
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
    _build():Agent {
        return new Agent(this)
    }


    /**
     * Creates an Agent and calls build() to return a generated Agent instance
     * @returns Promise<Agent>
     * @throws AgentError
     */
    async create():Promise<Agent> {
        console.log("Creating Agent");
        //Create Wallet

        

        //Validate non-optional Builder arguments
        console.log("Validating Builder Arguments")
        if(!WalletName.guard(this._walletName)){
            throw new AgentErrors.ValidationError("walletName")
        }
        if(!WalletPassword.guard(this._walletPassword)){
            throw new AgentErrors.ValidationError("walletPassword")
        }
        if(!StorageType.guard(this._storageType)){
            throw new AgentErrors.ValidationError("storageType")
        }

        //Validate optional Builder arguments
        if(!LedgerConfig.guard(this._ledgerConfig) && typeof this._ledgerConfig !== 'undefined'){
            throw new AgentErrors.ValidationError("ledgerConfig")
        }
        if(!MediatorConfig.guard(this._mediatorConfig) && typeof this._mediatorConfig !== 'undefined'){
            throw new AgentErrors.ValidationError("mediatorConfig")
        }

        //Create Wallet via the Wallet Interface
        await Wallet.createWallet(this._storageType, this._walletName, this._walletPassword);



        //Store Agent Config Variables via the Wallet Interface
        
        var config:AgentConfig = {
            walletName: this._walletName,
            walletPassword: this._walletPassword,
            storageType: this._storageType,
            mediatorConfig:this._mediatorConfig,
            ledgerConfig:this._ledgerConfig
        }

        console.log(config)
        //await Wallet.storeRecord(this._storageType, this._walletName, this._walletPassword, config);

        //Generate Agent instance
        return this._build()
    }
}








export interface AgentLoaderInterface {
    setWalletName(walletName:WalletName):AgentLoader,
    setWalletPassword(walletPassword:WalletPassword):AgentLoader,
    setStorageType(storageType:StorageType):AgentLoader,
    open():Agent
}

/**
 * Agent Loader - A Loader Class to authenticate and load an Agent
 * @interface AgentLoaderInterface
 */
export class AgentLoader implements AgentLoaderInterface {
    _walletName!:WalletName
    _walletPassword!:WalletPassword
    _storageType!:StorageType
    
    /**
     * Agent Loader - An instance of an Agent Loader Class to authenticate and load an Agent
     * @interface AgentLoaderInterface
     */
    constructor() {
        console.log("Loading Agent")
    }


    /**
     * Sets the name of the Agent's wallet
     * @param walletName Name of the wallet 
     * @returns AgentLoader
     * @throws ValidationError - AgentErrors.ValidationError
     */
    setWalletName(walletName:WalletName):AgentLoader {
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
     * Sets the password of the Agent's wallet 
     * @param walletPassword Password of the wallet 
     * @returns AgentLoader
     * @throws ValidationError - AgentErrors.ValidationError
     */
    setWalletPassword(walletPassword:WalletPassword):AgentLoader {
        //Validation
        try{
            WalletPassword.check(walletPassword)
        } catch(e){
            throw new AgentErrors.ValidationError("walletPassword", e.message)
        }

        this._walletPassword = walletPassword
        return this
    }


    /**
     * Sets the storage type of the Agent's wallet
     * @param storageType The type of storage implementation
     * @returns AgentLoader
     * @throws ValidationError - AgentErrors.ValidationError
     */
    setStorageType(storageType:StorageType):AgentLoader {
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
     * Opens an already created Agent Instance, calls build() to return a generated Agent instance
     * @returns Agent
     */
    open():Agent {
        //Authenticate
        //Open Wallet via the Wallet Interface

        //Retrieve Agent Config 

        //Verify 

        //Generate Agent instance
        const agent = new AgentBuilder()
            .setWalletName(this._walletName)
            .setWalletPassword(this._walletPassword)
            .setStorageType(this._storageType)
            //.setLedgerConfig(agentData.ledgerConfig)
            .setLedgerConfig({name:"TestNet"})
            .setMediatorConfig({invite: "invite", publicKey:"key", endpoint: "endpoint"})
            ._build();
        return agent
    }
}




//(JamesKEbert)TODO: Identify Solution for default wallet name
export interface AgentDirectorInterface {
    createDefaultDevAgent():AgentBuilder,
    loadDefaultDevAgent():AgentLoader
}

export class AgentDirector implements AgentDirectorInterface {
    #agentBuilder:AgentBuilder

    constructor() {
        console.log("Directing Agent Building");
        this.#agentBuilder = new AgentBuilder()
    }
    
    /**
     * Creates a default agent. Returns the builder so that additional modifications could be made if desired, therefore you must call .create() to create the agent.
     * @returns AgentBuilder
     */
    createDefaultDevAgent():AgentBuilder{
        console.log("Creating Default Dev Agent")
        return this.#agentBuilder
            .setWalletName("dev_wallet")
            .setWalletPassword("dev_password")
            .setStorageType("LibIndyNonSecrets")
            .setLedgerConfig({name:"TestNet"})
            .setMediatorConfig({invite: "invite", publicKey:"key", endpoint: "endpoint"})
    }

    /**
     * Loads a default agent. Returns the loader so that additional modifications could be made if required, therefore you must call .open() to generate the agent.
     * @returns AgentLoader
     */
    loadDefaultDevAgent():AgentLoader{
        console.log("Loading Default Dev Agent")
        return new AgentLoader()
            .setWalletName("dev_wallet")
            .setWalletPassword("dev_password")
            .setStorageType("LibIndyNonSecrets")
    }
}