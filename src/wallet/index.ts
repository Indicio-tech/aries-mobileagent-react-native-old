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


//DIDs
export const DIDKeyPair = Record({
    did:String,
    key:String,
})
export type DIDKeyPair = Static<typeof DIDKeyPair>


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

export const RecordSearchQuery = String
export type RecordSearchQuery = Static<typeof RecordSearchQuery>

export const RecordSearchOptions = String
export type RecordSearchOptions = Static<typeof RecordSearchOptions>

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
     * Opens the wallet, and stores the handle in the wallet service
     * @param walletName The name of the wallet
     * @param walletPassword The password for the wallet
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
     * Create a DID Key pair
     * @returns promise of a DID Key Pair
     */
    createDID():Promise<DIDKeyPair>

    /**
     * Packs a message for sending to recipients with the supplied verkeys
     * @param recipientKeys The keys to encrypt the message for
     * @param senderVerkey The Agent's verkey to encrypt the message with
     * @param message The message to encrypt
     * @returns A buffer of the encrypted message. Can use Buffer.from(buffer).toString('utf-8') to get out a string of the encrypted message.
     */
    packMessage(
        recipientKeys:string[],
        senderVerkey:string,
        message:string
    ):Promise<Buffer>

    /**
     * Unpacks a message
     * @param message The unencrypted message
     * @returns A string of the unencrypted message
     */
    unpackMessage(
        message:string
    ):Promise<string>

    /**
     * Verifies the signature of data
     * @param signerVerkey The signer's verkey
     * @param signedData The signed data
     * @param signature The signature
     * @returns Boolean of whether the signature is valid
     */
    verifyData(
        signerVerkey:string,
        signedData:number[],
        signature:number[]
    ):Promise<boolean>

    /**
     * Optional method for storing records in the wallet (such as non secrets in the indy-sdk)
     * @param record
     * @returns promise of void
     */
    storeRecord?(
        record:StorageRecord
    ):Promise<void>

    /**
     * Optional method for retrieving records in the wallet (such as non secrets in the indy-sdk)
     * @param recordType the type of record
     * @param recordID the id of the record to retrieve
     * @returns promise of void
     */
    getRecord?(
        recordType: string,
        recordID: string,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<string>

    /**
     * Optional method for seraching for records in the wallet (such as non secrets in the indy-sdk)
     * @returns promise of void
     */
    searchRecords?(
        recordType: string,
        query:RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number
    ):Promise<string>

    /**
     * Optional method of updating the record value in the wallet (such as non secrets in the indy-sdk)--not including the records tags
     * @param recordType 
     * @param recordID 
     * @param recordValue 
     */
    updateRecord?(
        recordType:string,
        recordID:string,
        recordValue:string,
    ): Promise<void>

    /**
     * Optional method of adding tags to a record
     * @param recordType 
     * @param recordID 
     * @param recordTags 
     */
    addTags?(
        recordType:string,
        recordID:string,
        recordTags:string,
    ): Promise<void>
}