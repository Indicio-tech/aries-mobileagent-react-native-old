import { v4 as uuidv4 } from 'uuid'

import storagePermissions from '../../permissions'

import WalletServiceInterface, { WalletName, WalletPassword, MasterSecretID, LedgerConfigName, LedgerGenesisString, StorageRecord, RecordRetrievalOptions, RecordSearchQuery, RecordSearchOptions, DIDKeyPair } from '../index'

import IndyConnection from './connection/indy'

//(JamesKEbert)TODO: Abstract into separate repo or project potentially

class IndyService implements WalletServiceInterface {
    walletServiceType:string = "Indy"
    #indy:IndyConnection

    //JamesKEbert TODO: Replace with a reference to the given wallet handle int
    #walletName!:WalletName
    #walletPassword!:WalletPassword

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

        //Open Wallet
        await this.openWallet(walletName, walletPassword)

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
        this.#walletName = walletName
        this.#walletPassword = walletPassword

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
    async createDID():Promise<DIDKeyPair> {
        console.info("Creating DID")
        
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        const DID:DIDKeyPair = await this.#indy.createAndStoreMyDID(
            this.#walletName, 
            this.#walletPassword,
            {}
        )

        console.info("Created DID Key Pair", DID)

        return DID
    }


    async packMessage(
        recipientKeys:string[],
        senderVerkey:string,
        message:string
    ):Promise<Buffer> {
        console.info("Packing Message")
        
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        const packedMessage:Buffer = await this.#indy.packMessage(
            this.#walletName, 
            this.#walletPassword,
            recipientKeys,
            senderVerkey,
            message
        )

        return packedMessage
    }

    async unpackMessage(
        message:string
    ):Promise<string> {
        console.info("Unpacking Message")
        
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        const unpackedMessage:string = await this.#indy.unpackMessage(
            this.#walletName, 
            this.#walletPassword,
            message
        )

        return unpackedMessage
    }

    async verifyData(
        signerVerkey:string,
        signedData:number[],
        signature:number[]
    ):Promise<boolean> {
        console.info("Verifying Data")

        const verified:boolean = await this.#indy.verify(
            signerVerkey,
            signedData,
            signature
        )

        return verified
    }

    async storeRecord(
        record:StorageRecord
    ):Promise<void> {
        
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        await this.#indy.addRecord(
            this.#walletName, 
            this.#walletPassword,
            record.type,
            record.id,
            record.content,
            record.tags
        )
    }

    async getRecord(
        recordType: string,
        recordID: string,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<string>{

        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        return await this.#indy.getRecord(
            this.#walletName, 
            this.#walletPassword,
            recordType,
            recordID,
            retrievalOptions
        )
    }

    async searchRecords(
        recordType: string,
        query:RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number = 100
    ):Promise<string> {

        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        return await this.#indy.searchRecords(
            this.#walletName, 
            this.#walletPassword,
            recordType,
            query,
            retrievalOptions,
            count
        )
    }
       
    async updateRecord(
        recordType:string,
        recordID:string,
        recordValue:string,
    ): Promise<void> {
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        await this.#indy.updateRecord(
            this.#walletName, 
            this.#walletPassword,
            recordType,
            recordID,
            recordValue,
        )
    }

    async addTags(
        recordType:string,
        recordID:string,
        recordTags:string,
    ): Promise<void> {
        if(!this.#walletName || !this.#walletPassword){
            throw new Error("Wallet has not been opened")
        }

        await this.#indy.addTags(
            this.#walletName, 
            this.#walletPassword,
            recordType,
            recordID,
            recordTags,
        )
    }
}

export default new IndyService()