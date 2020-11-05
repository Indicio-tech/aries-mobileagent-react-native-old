import {Record, Static, String, Undefined} from 'runtypes'

import Agent from './agent'

//Agent Types
export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export const MediatorConfig = Record({
    invite: String,
    mediatorID: String
})
export type MediatorConfig = Static<typeof MediatorConfig>


export const GenesisString = String
export type GenesisString = Static<typeof GenesisString>

export const LedgerConfig = Record({
    name: String,
    genesisString: GenesisString
})
export type LedgerConfig = Static<typeof LedgerConfig>

export const AgentConfig = Record({
    walletName:WalletName,
    walletPassword:WalletPassword,
    masterSecretID:MasterSecretID,
    ledgerConfig:LedgerConfig,
    defaultMediatorConfig:MediatorConfig.Or(Undefined)
})
export type AgentConfig = Static<typeof AgentConfig>



export default interface AMARNInterface {
    /**
     * Checks to identify if the agent has been created
     * @returns boolean - Returns a true if configuration has occurred, false if configuration has not occurred
     * @throws Error thrown if there is an error while checking the configuration
     */
    created():boolean

    /**
     * Generate Master Secret ID
     * @returns promise of MasterSecretID
     * @throws Error thrown if there is an error while creating the agent
     */
    generateMasterSecretID():Promise<MasterSecretID>

    /**
     * Creates the agent via the provided configuration
     * @returns void
     * @throws Error thrown if there is an error while creating the agent
     * ValidationError - AgentErrors.ValidationError
     */
    createAgent(creationParameters:AgentConfig):Promise<Agent>

    /**
     * Loads the agent
     * @returns agent - an agent object
     * @throws Error thrown if there is an error while loading the agent
     */
    loadAgent(
        walletName:WalletName, 
        walletPassword: WalletPassword, 
        masterSecretID: MasterSecretID
    ):Promise<Agent>
}