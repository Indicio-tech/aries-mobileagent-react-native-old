import { Static, Record, String } from 'runtypes'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export const LedgerConfigName = String
export type LedgerConfigName = Static<typeof LedgerConfigName>

export const LedgerGenesisString = String
export type LedgerGenesisString = Static<typeof LedgerGenesisString>


//Optional Storage Types
export const StorageRecord = Record({
    type:String,
    id:String,
    content:String,
    tags:String
})
export type StorageRecord = Static<typeof StorageRecord>

export const RecordRetrievalOptions = String
export type RecordRetrievalOptions = Static<typeof RecordRetrievalOptions>

export default interface WalletServiceInterface {
    walletServiceType:string
    /**
     * Creates the Wallet and configures the Ledger/pool
     * @param walletName The name of the wallet
     * @param walletPassword The password to encrypt the wallet
     * @param masterSecretID The master secret ID of the wallet
     * @param ledgerConfigName The Identifying name of the ledger configuration
     * @param ledgerGenesisString The ledger's genesis file in string format
     * @returns promise of void
     */
    createWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        masterSecretID:MasterSecretID,
        ledgerConfigName:LedgerConfigName,
        ledgerGenesisString:LedgerGenesisString
    ):Promise<void>

    /**
     * Opens the wallet
     * @param walletName 
     * @param walletPassword 
     * @returns promise of void
     */
    openWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword,
    ):Promise<void>

    /**
     * Opens the ledger
     * @param ledgerConfigName The configuration name used to create the agent
     * @returns promise of void
     */
    openLedger(
        ledgerConfigName:LedgerConfigName,
    ):Promise<void>

    /**
     * Generates a Master Secret ID for use in wallet creation
     * @returns promise of MasterSecretID
     */
    generateMasterSecretID():Promise<MasterSecretID>

    /**
     * Optional method for storing records in the wallet (such as non secrets in the indy-sdk)
     * @param walletName
     * @param walletPassword
     * @param record
     * @returns promise of void
     */
    storeRecord?(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        record:StorageRecord
    ):Promise<void>

    getRecord?(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        recordType: string,
        recordID: string,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<string>
}