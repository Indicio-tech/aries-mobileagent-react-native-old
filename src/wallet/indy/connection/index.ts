import { NativeModules } from 'react-native';
const RNFS = require('react-native-fs')

import * as AgentErrors from '../../../errors'
import {IndyError} from '../../errors'
import { WalletName, WalletPassword } from '../../../agent/agent'

//Libindy Native Bridging
const {Indy} = NativeModules

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

function createWalletConfig(walletName:WalletName, storagePath:String = defaultStoragePath):String {
    let walletConfig:WalletConfig = {
        id: walletName,
        storage_config:{
            path: storagePath
        }
    }
    return JSON.stringify(walletConfig)
}

function createWalletCredentials(walletPassword:WalletPassword):String {
    let walletCredentials:WalletCredentials = {
        key: walletPassword
    }
    return JSON.stringify(walletCredentials)
}



async function createWallet(walletName:WalletName, walletPassword:WalletPassword):Promise<void> {
    try {    
        await Indy.createWallet(
            createWalletConfig(walletName, defaultStoragePath), 
            createWalletCredentials(walletPassword)
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



function openWallet(){
    console.log("indy open wallet")
}

export interface libIndyInterface {
    /**
     * Create a libindy wallet
     * @param walletName 
     * @param walletPassword 
     * @returns Promise<void>
     * @throws IndyError
     */
    createWallet(walletName:WalletName, walletPassword:WalletPassword):void,
    openWallet():void,
}


/**
 * An interface for interacting and utilizing libindy
 * @interface libIndyInterface
 */
const libIndy:libIndyInterface = {
    createWallet,
    openWallet
}

export default libIndy