import { NativeModules } from 'react-native';
import { parse } from 'url';
const RNFS = require('react-native-fs')

import * as AgentErrors from '../../../errors'
import {IndyError} from '../../errors'

import storagePermissions from '../../../permissions'

import IndyInterface, { 
    WalletName, 
    WalletPassword, 
    WalletConfig, 
    WalletCredentials, 
    MasterSecretID, 
    PoolConfig, 
    PoolConfigName, 
    PoolRuntimeConfig,
    DIDKeyPair,
    DIDConfig,
    RecordType,
    RecordID,
    RecordValue,
    RecordTags,
    RecordRetrievalOptions,
    RecordSearchOptions,
    RecordSearchQuery,
} from './indyInterface'

//Libindy Native Bridging
const { Indy } = NativeModules

const defaultStoragePath = RNFS.DocumentDirectoryPath + '/wallets'


export default class IndyConnection implements IndyInterface {
    constructor(){
        console.info("Creating Indy Connection")
    }


    _createWalletConfig(walletName:WalletName, storagePath:string = defaultStoragePath):String {
        let walletConfig:WalletConfig = {
            id: walletName,
            storage_config:{
                path: storagePath
            }
        }
        return JSON.stringify(walletConfig)
    }
    
    _createWalletCredentials(walletPassword:WalletPassword):String {
        let walletCredentials:WalletCredentials = {
            key: walletPassword
        }
        return JSON.stringify(walletCredentials)
    }

    async createWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void> {
        try {   
            console.info("Creating Wallet")
            
            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)

            //Create the Wallet
            await Indy.createWallet(
                walletConfig,
                walletCredentials
            )  
            
            console.info("Wallet Created")

            return
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  

            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async openWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void> {
        try {   
            console.info("Checking Wallet")

            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)

            //Create the Wallet
            await Indy.checkWallet(
                walletConfig,
                walletCredentials
            )  
            
            console.info("Wallet has been created and opened")

            return
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  

            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async createMasterSecretID(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        masterSecretID:MasterSecretID
        ):Promise<MasterSecretID> {
        try {   
            console.info("Creating Master Secret ID")

            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)

            //Create the Master Secret ID
            const storedMasterSecretID = await Indy.createMasterSecret(
                walletConfig,
                walletCredentials,
                masterSecretID
            )  
            
            console.info("Master Secret ID Created")

            return storedMasterSecretID
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  

            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async createPoolLedgerConfig(configName:PoolConfigName,
        poolConfig:PoolConfig){
        try {   
            console.info(`Creating Pool Config with name ${configName}`)

            //Check Permissions
            await storagePermissions()

            //Create the Pool Config
            await Indy.createPoolLedgerConfig(
                configName,
                poolConfig
            )  
            
            console.info("Pool Config Created")

            return
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
                
                if(indyError.indyErrorCode === '306'){
                    console.info("Pool Config Already Created, Continuing...")
                    return
                }
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async openPool(configName:PoolConfigName, runtimeConfig:PoolRuntimeConfig = null):Promise<void> {
        try {   
            console.info(`Opening Pool with name ${configName}`)
            
            //Check Permissions
            await storagePermissions()
            //(JamesKEbert) TODO: Check network permissions/connectivity?

            //Open up the pool
            await Indy.checkPool(
                configName, 
                runtimeConfig
            )  
            
            console.info("Pool Opened")

            return
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async createAndStoreMyDID(walletName:WalletName, walletPassword:WalletPassword, DIDConfig:DIDConfig):Promise<DIDKeyPair> {
        try {   
            console.info(`Creating a DID with config:`, DIDConfig)
            
            //Check Permissions
            await storagePermissions()
            //(JamesKEbert) TODO: Check network permissions/connectivity?

            //Open up the pool
            const DID:DIDKeyPair = await Indy.createAndStoreMyDid(
                walletName, 
                walletPassword,
                JSON.stringify(DIDConfig)
            )  
            

            return DID
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async packMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        recipientKeys:string[],
        senderVerkey:string,
        message:string
    ):Promise<Buffer> {
        try {   
            console.info(`Packing Message`)
            
            //Check Permissions
            await storagePermissions()

            //Pack Message
            const packedMessage:any = await Indy.packMessage(
                walletName, 
                walletPassword,
                recipientKeys,
                senderVerkey,
                message
            )  
            
            const bufferedMessage:Buffer = Buffer.from(packedMessage)

            return bufferedMessage
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async unpackMessage(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        message:string
    ):Promise<string> {
        try {   
            console.info(`Unpacking Message`)
            
            //Check Permissions
            await storagePermissions()

            //Pack Message
            const unpackedMessage:string = await Indy.unpackMessage(
                walletName, 
                walletPassword,
                message
            )  
            
            console.log(unpackedMessage)

            return unpackedMessage
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        }
    }

    async addRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID,
        recordValue:RecordValue,
        recordTags:RecordTags
    ): Promise<void> {
        try {   
            console.info(`Adding Record`)
            
            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)
            
            //Add Record
            await Indy.addRecord(
                walletConfig, 
                walletCredentials,
                recordType,
                recordID,
                recordValue,
                recordTags
            )  

            return
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        } 
    }

    async getRecord(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        recordID:RecordID, 
        retrievalOptions:RecordRetrievalOptions = "{}"
    ):Promise<string> {
        try {   
            console.info(`Getting Record by ID ${recordID} and type ${recordType}`)
            
            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)

            //Add Record
            const record = await Indy.getRecord(
                walletConfig, 
                walletCredentials,
                recordType,
                recordID,
                retrievalOptions
            )  
            
            
            return record
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        } 
    }

    async searchRecords(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        recordType:RecordType,
        query:RecordSearchQuery,
        retrievalOptions:RecordSearchOptions = "{}",
        count:number = 100
    ):Promise<string> {
        try {   
            console.info(`Searching for records by query ${query} and type ${recordType}`)
            
            //Check Permissions
            await storagePermissions()

            const walletConfig = this._createWalletConfig(walletName, defaultStoragePath)
            const walletCredentials = this._createWalletCredentials(walletPassword)

            //Add Record
            const records:string = await Indy.searchFetchNextRecords(
                walletConfig, 
                walletCredentials,
                recordType,
                query,
                retrievalOptions,
                count
            )  
            
            return records
        } catch (error) {
            //(JamesKEbert)TODO: Revise this
            //Attempt to make into an error, if not possible, throw original error  
            
            var indyError;
            try{
                indyError = new IndyError(error.message);
            } catch(e){
                throw error
            } 
        
            throw indyError
        } 
    }
}