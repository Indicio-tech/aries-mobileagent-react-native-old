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
    RecordType,
    RecordID,
    RecordValue,
    RecordTags,
    RecordRetrievalOptions
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
}