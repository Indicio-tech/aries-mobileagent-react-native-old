import { Static, Literal, Record, String, Null, Union, Boolean, Undefined, Partial } from 'runtypes'

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

//Pool Ledger
export const PoolConfigName = String
export type PoolConfigName = Static<typeof PoolConfigName>

export const PoolConfig = String
export type PoolConfig = Static<typeof PoolConfig>

export const PoolRuntimeConfig = String.Or(Null)
export type PoolRuntimeConfig = Static<typeof PoolRuntimeConfig>

//DIDs
export const DIDKeyPair = Record({
    did:String,
    key:String,
})
export type DIDKeyPair = Static<typeof DIDKeyPair>

export const DIDConfig = Record({}).And(Partial({
    did: String,
    seed: String, //UTF-8, base64, or hex
    crypto_type: Union(Literal("ed25519")),
    cid: Boolean,
    method_name: String
}))
export type DIDConfig = Static<typeof DIDConfig>

//Storage
export const RecordType = String
export type RecordType = Static<typeof RecordType>

export const RecordID = String
export type RecordID = Static<typeof RecordID>

export const RecordValue = String
export type RecordValue = Static<typeof RecordValue>

//JamesKEbert TODO: Change to a regex to check JSON string?
export const RecordTags = String
export type RecordTags = Static<typeof RecordTags>

//JamesKEbert TODO: use regex/schema to check JSON content
export const RecordRetrievalOptions = String
export type RecordRetrievalOptions = Static<typeof RecordRetrievalOptions>

export const RecordSearchQuery = String
export type RecordSearchQuery = Static<typeof RecordSearchQuery>

export const RecordSearchOptions = String
export type RecordSearchOptions = Static<typeof RecordSearchOptions>



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
     * Check and open to see if a wallet has been created
     * @param walletName 
     * @param walletPassword 
     * @returns promise of void
    */
    openWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void>,
    
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
    openPool(configName:PoolConfigName, runtimeConfig:PoolRuntimeConfig):Promise<void>
    
    /**
     * Creates a DID Key Pair
     */
    createAndStoreMyDID(walletName:WalletName, walletPassword:WalletPassword, DIDConfig:DIDConfig):Promise<DIDKeyPair>

    /**
     * Packs a message for sending to recipients with the supplied verkeys
     * @param walletName Name of wallet to alter
     * @param walletPassword Password of wallet
     * @param recipientKeys The keys to encrypt the message for
     * @param senderVerkey The Agent's verkey to encrypt the message with
     * @param message The message to encrypt
     */
    packMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        recipientKeys:string[],
        senderVerkey:string,
        message:string
    ):Promise<Buffer>

    /**
     * Unpacks a message
     * @param walletName Name of wallet to alter
     * @param walletPassword Password of wallet
     * @param message The unencrypted message
     */
    unpackMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        message:string
    ):Promise<string>

    /**
     * Verifies Data
     * @param signerVerkey The data signer verkey
     * @param signedData The signed data
     * @param signature The signature over the data
     * @returns boolean of verified data
     */
    verify(
        signerVerkey:string,
        signedData:number[],
        signature:number[]
    ):Promise<boolean> 

    /**
     * Adds a record
     */
    addRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID,
        recordValue:RecordValue,
        recordTags:RecordTags
    ):Promise<void>

    getRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID, 
        retrievalOptions:RecordRetrievalOptions
    ):Promise<string>

    searchRecords(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        query:RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number
    ):Promise<string>

    updateRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID,
        recordValue:RecordValue,
    ): Promise<void>

    addTags(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID,
        recordTags:RecordTags,
    ): Promise<void>
}