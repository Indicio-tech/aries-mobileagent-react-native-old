import { v4 as uuidv4 } from 'uuid'
import { Verkey } from '../../agent/services/dids/didServiceInterface'

import * as AgentErrors from '../../errors'

import storagePermissions from '../../permissions'

import WalletServiceInterface, { WalletName, WalletPassword, MasterSecretID, LedgerConfigName, LedgerGenesisString, StorageRecord, RecordRetrievalOptions, RecordSearchQuery, RecordSearchOptions, DIDKeyPair } from '../index'

import IndyConnection from './connection/indy'

//(JamesKEbert)TODO: Abstract into separate repo or project potentially

export default class IndyService implements WalletServiceInterface {
    walletServiceType:string = "Indy"
    #indy:IndyConnection

    constructor(){
        console.info(`Created IndyService`)
        this.#indy = new IndyConnection()
    }

    async createWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        masterSecretID: MasterSecretID,
        ledgerConfigName:LedgerConfigName,
        ledgerGenesisString:LedgerGenesisString
    ):Promise<void> {
        console.info("Creating Wallet")
        
        //Check Permissions
        await storagePermissions()

        //Create the wallet
        await this.#indy.createWallet(walletName, walletPassword)

        //Create the master secret ID
        await this.#indy.createMasterSecretID(walletName, walletPassword, masterSecretID)

        //Create the pool configuration
        await this.#indy.createPoolLedgerConfig(ledgerConfigName, ledgerGenesisString)

        //Open the pool
        await this.#indy.openPool(ledgerConfigName, null)

        console.info("Wallet Creation Finished")

        return
    }

    async openWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword,
    ):Promise<void> {
        console.info("Opening Wallet")

        await this.#indy.openWallet(walletName, walletPassword)

        console.info("Wallet Opened")
    }

    async openLedger(ledgerConfigName:LedgerConfigName):Promise<void> {
        console.info("Opening Ledger")

        await this.#indy.openPool(ledgerConfigName, null)

        console.info("Ledger Opened")
    }

    async generateMasterSecretID():Promise<MasterSecretID> {
        return uuidv4()
    }

    //JamesKEbert TODO: Expose Wallet seed creation/other arguments desired
    async createDID(walletName:WalletName, walletPassword:WalletPassword):Promise<DIDKeyPair> {
        console.info("Creating DID")
        
        const DID:DIDKeyPair = await this.#indy.createAndStoreMyDID(
            walletName, 
            walletPassword,
            {}
        )

        console.info("Created DID Key Pair", DID)

        return DID
    }


    async packMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recipientKeys:string[],
        senderVerkey:string,
        message:string
    ):Promise<Buffer> {
        console.info("Packing Message")
        
        const packedMessage:Buffer = await this.#indy.packMessage(
            walletName, 
            walletPassword,
            recipientKeys,
            senderVerkey,
            message
        )

        return packedMessage
    }

    async unpackMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        message:string
    ):Promise<string> {
        console.info("Unpacking Message")
        
        const unpackedMessage:string = await this.#indy.unpackMessage(
            walletName, 
            walletPassword,
            message
        )

        return unpackedMessage
    }

    async storeRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        record:StorageRecord
    ):Promise<void> {
        await this.#indy.addRecord(
            walletName, 
            walletPassword,
            record.type,
            record.id,
            record.content,
            record.tags
        )
    }

    async getRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        recordType: string,
        recordID: string,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<string>{
        return await this.#indy.getRecord(
            walletName, 
            walletPassword,
            recordType,
            recordID,
            retrievalOptions
        )
    }

    async searchRecords(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType: string,
        query:RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number = 100
    ):Promise<string> {
        return await this.#indy.searchRecords(
            walletName, 
            walletPassword,
            recordType,
            query,
            retrievalOptions,
            count
        )
    }
        
}