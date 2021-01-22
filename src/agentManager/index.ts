import { v4 as uuidv4 } from 'uuid'

import * as AgentErrors from '../errors'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'

import AgentManagerInterface, {MasterSecretID, AgentConfig } from './agentManagerInterface'

import Agent from '../agent'

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
        const startTime = Date.now()

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
                creationParameters.walletName, 
                creationParameters.walletPassword,
                creationParameters.masterSecretID,
                creationParameters.ledgerConfig.name,
                creationParameters.ledgerConfig.genesisString
            )

            //Store the pool configuration name
            await this.#storageService.storeRecord(
                creationParameters.walletName, 
                creationParameters.walletPassword,
                {
                    type: "ledgerConfig",
                    id: `${creationParameters.walletName}-default`, //JamesKEbert TODO: Replace default ID with multi-ledger functionality
                    content: JSON.stringify({
                        configName: creationParameters.ledgerConfig.name
                    }),
                    tags: {
                        default: "true"
                    }
                }
            )

            //Create Agent Object
            const agent = new Agent(
                creationParameters.walletName, 
                creationParameters.walletPassword,
                this.#walletService,
                this.#storageService
            );

            //TODO: REMOVE
            await agent.startup()


            //Fetch governance framework

            //Initiate Mediation connection
        
            const durationTime = Date.now() - startTime
            console.info(`Finished Agent Creation, took ${durationTime} milliseconds`)
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