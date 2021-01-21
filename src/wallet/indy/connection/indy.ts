import { NativeModules } from 'react-native';
const RNFS = require('react-native-fs')

import * as AgentErrors from '../../../errors'
import {IndyError} from '../../errors'

import storagePermissions from '../permissions'

import IndyInterface, { WalletName, WalletPassword, WalletConfig, WalletCredentials, MasterSecretID, PoolConfig, PoolConfigName, PoolRuntimeConfig } from './indyInterface'

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

    async checkPool(configName:PoolConfigName, runtimeConfig:PoolRuntimeConfig = null):Promise<void> {
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
}