import {Record, Union, Literal, Static, String, Undefined} from 'runtypes'

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

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export const MediatorConfig = Record({
    invite: String,
    publicKey: String,
    endpoint: String
})
export type MediatorConfig = Static<typeof MediatorConfig>


export const GenesisString = String
export type GenesisString = Static<typeof GenesisString>

export const LedgerConfig = Record({
    name: String,
    genesisString: GenesisString
})
export type LedgerConfig = Static<typeof LedgerConfig>
//Potential types for having preloaded ledger configurations in AMA-RN:
/*//Ledger Configuration, allowing use of a preloaded ledger, or specifying a name and genesis string
export const GenesisString = String
export type GenesisString = Static<typeof GenesisString>

export const PreloadedLedgers = Union(
    Literal('Indicio-TestNet')
)

export const LedgerConfig = 
    Record({
        name: PreloadedLedgers,
    })
    .Or(
        Record({
            name: String,
            genesisString: GenesisString
        })
    )
export type LedgerConfig = Static<typeof LedgerConfig>
*/


export const AgentConfig = Record({
    walletName:WalletName,
    walletPassword:WalletPassword,
    masterSecretID:MasterSecretID,
    ledgerConfig:LedgerConfig,
    defaultMediatorConfig:MediatorConfig.Or(Undefined)
})
export type AgentConfig = Static<typeof AgentConfig>





export interface AgentManagerInterface {
    created():boolean,
    generateMasterSecretID():Promise<MasterSecretID>,
    createAgent(creationParameters:AgentConfig):Promise<void>,
    loadAgent():any
}

export default class AgentManager implements AgentManagerInterface {
    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface

    constructor(walletService:WalletServiceInterface,storageService:StorageServiceInterface){
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
     * Generate Master Secret ID
     * @returns promise of MasterSecretID
     * @throws Error - AgentErrors.Error - Thrown if there is an error while creating the agent
     */
    async generateMasterSecretID():Promise<MasterSecretID> {
        console.info("Generating Master Secret ID")

        return await this.#walletService.generateMasterSecretID()
    }

    /**
     * Creates the agent via the provided configuration
     * @returns void
     * @throws Error - AgentErrors.Error - Thrown if there is an error while creating the agent
     * ValidationError - AgentErrors.ValidationError
     */
    async createAgent(creationParameters:AgentConfig):Promise<void> {
        console.info("Creating Agent")
        console.log("Creating Agent with parameters: ", creationParameters);

        //Validate Creation parameters
        try{
            AgentConfig.check(creationParameters)
        } catch (error) {
            throw new AgentErrors.ValidationError("creationParameters", error.message)
        }

        //Perform creation
        try{
            //Open Storage Service
            //createAgent()
                //Create Indy Wallet (name, password, mastersecretID)
                //Open Indy Pool
                //Store Indy Pool Config
                //Create Master Secret ID in Indy
                //Create agent object
            //(Optional) Governance Framework Fetching
            //(Optional) Initiate mediation request
            //Return Agent object

            
            await this.#walletService.createWallet(
                creationParameters.walletName, creationParameters.walletPassword,
                creationParameters.masterSecretID,
                creationParameters.ledgerConfig.name,
                creationParameters.ledgerConfig.genesisString
            )
        } catch (error) {
            throw error
        }
    }


    /**
     * Loads the agent
     * @returns agent - an agent object
     * @throws Error - AgentErrors.Error - Thrown if there is an error while loading the agent
     */
    loadAgent(/*walletName:WalletName, walletPassword: WalletPassword, masterSecretID*/){
        console.info("Loading Agent")
        //Open Storage Service
        //Open Wallet (name, password, mastersecretID)
        //Load Indy Pool Config
        //Open Indy Pool

    }
}