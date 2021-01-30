import { v4 as uuidv4 } from 'uuid'

import * as AgentErrors from '../errors'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'

import AgentManagerInterface, {WalletName, WalletPassword,MasterSecretID, AgentConfig } from './agentManagerInterface'

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
        throw Error("Not Implemented")
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
    async createAgent(creationParameters:AgentConfig):Promise<Agent> {
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
                    content: {
                        configName: creationParameters.ledgerConfig.name
                    },
                    tags: {
                        default: "true"
                    }
                }
            )

            //Create Agent Object
            const agent = new Agent(
                creationParameters.walletName, 
                creationParameters.walletPassword,
                creationParameters.masterSecretID,
                this.#walletService,
                this.#storageService
            );

            await agent.startup()

            //Fetch governance framework

            //Initiate Mediation connection
            if(creationParameters.defaultMediatorConfig){
                //agent.connectionsService.receiveNewInvitation(creationParameters.defaultMediatorConfig.invite)
                const invitation = await agent.connectionsService.receiveInvitation(
                    creationParameters.defaultMediatorConfig.invite, 
                    "mediation-recipient", 
                    true
                )
                const connection = await agent.connectionsService.createConnectionByInvitationID(invitation.invitationID)
                // await agent.mediationService.addMediator(
                //     creationParameters.defaultMediatorConfig.invite, 
                //     creationParameters.defaultMediatorConfig.endpoint,
                //     creationParameters.defaultMediatorConfig.publicKey
                // )
                // agent.connectionsService
            }

            const durationTime = Date.now() - startTime
            console.info(`Finished Agent Creation, took ${durationTime} milliseconds`)
            
            return agent
        } catch (error) {
            throw error
        }
    }


    /**
     * Loads the agent
     * @returns agent - an agent object
     * @throws Error - AgentErrors.Error - Thrown if there is an error while loading the agent
     */
    async loadAgent(
        walletName:WalletName, 
        walletPassword: WalletPassword, 
        masterSecretID: MasterSecretID
    ):Promise<Agent>{
        console.info("Loading Agent")
        
        //Validate Loading parameters
        try{
            WalletName.check(walletName)
        } catch (error) {
            throw new AgentErrors.ValidationError("walletName", error.message)
        }
        try{
            WalletPassword.check(walletPassword)
        } catch (error) {
            throw new AgentErrors.ValidationError("walletPassword", error.message)
        }
        try{
            MasterSecretID.check(masterSecretID)
        } catch (error) {
            throw new AgentErrors.ValidationError("masterSecretID", error.message)
        }

        //Create Agent Object
        const agent = new Agent(
            walletName, 
            walletPassword,
            masterSecretID,
            this.#walletService,
            this.#storageService
        );

        await agent.startup()

        return agent
    }
}