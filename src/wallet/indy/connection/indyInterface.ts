import { Static, Record, String, Null } from 'runtypes'

export const WalletConfig = Record({
    id: String,
    storage_config: Record({
        path: String
    })
})
export type WalletConfig = Static<typeof WalletConfig>


export const WalletCredentials = Record({
    key: String
})
export type WalletCredentials = Static<typeof WalletCredentials>

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export const PoolConfigName = String
export type PoolConfigName = Static<typeof PoolConfigName>

export const PoolConfig = String
export type PoolConfig = Static<typeof PoolConfig>

export const PoolRuntimeConfig = String.Or(Null)
export type PoolRuntimeConfig = Static<typeof PoolRuntimeConfig>


export default interface IndyInterface {
    /**
     * Create a libindy wallet
     * @param walletName 
     * @param walletPassword 
     * @returns promise of void
     * @throws IndyError
     */
    createWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void>,
    /**
     * Create a Master Secret ID
     * @param walletName 
     * @param walletPassword 
     * @param masterSecretID The MasterSecretID. TODO: Make an optional argument in the future?
     * @returns Promise<void>
     * @throws IndyError
     */
    createMasterSecretID(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        masterSecretID:MasterSecretID
    ):Promise<MasterSecretID>
    /**
     * Create a pool/ledger config
     * @param configName The identifying name of the pool/ledger, such as Indicio-TestNet or Sovrin-Staging
     * @param poolConfig The pool config, or know as the genesis file in string form
     */
    createPoolLedgerConfig(
        configName:PoolConfigName,
        poolConfig:PoolConfig
    ):Promise<void>
    /** 
     * Check and open pool/ledger by pool config name
     * @param configName The identifying name of the pool/ledger, such as Indicio-TestNet or Sovrin-Staging
     * @param runtimeConfig Runtime pool configuration. By default is null
     * @returns promise of void
    */
    checkPool(configName:PoolConfigName, runtimeConfig:PoolRuntimeConfig):Promise<void>
}