import {Record, Union, Literal, Static, String, Undefined} from 'runtypes'

import Agent from '../agent'

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

export default interface AgentManagerInterface {
    generateMasterSecretID():Promise<MasterSecretID>,
    createAgent(creationParameters:AgentConfig):Promise<Agent>,
    loadAgent(
        walletName:WalletName, 
        walletPassword: WalletPassword, 
        masterSecretID: MasterSecretID
    ):Promise<Agent>
}