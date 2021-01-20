import { NativeModules } from 'react-native';
const RNFS = require('react-native-fs')

import * as AgentErrors from '../../errors'
import {IndyError} from '../errors'
import { WalletName, WalletPassword } from '../../agent'

//Libindy Native Bridging
const { LibIndy } = NativeModules

const defaultStoragePath = RNFS.DocumentDirectoryPath + '/wallets'

type WalletConfig = {
    id: String,
    storage_config:{
        path:String
    }
}

type WalletCredentials = {
    key: String
}



export interface IndyInterface {
    createWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void>
}

export default class Indy implements IndyInterface {
    constructor(){
        console.info("Creating Indy Connection")
    }


    _createWalletConfig(walletName:WalletName, storagePath:String = defaultStoragePath):String {
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

    /**
     * Create a libindy wallet
     * @param walletName 
     * @param walletPassword 
     * @returns Promise<void>
     * @throws IndyError
     */
    async createWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void> {
        try {    
            await LibIndy.createWallet(
                this._createWalletConfig(walletName, defaultStoragePath), 
                this._createWalletCredentials(walletPassword)
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
}