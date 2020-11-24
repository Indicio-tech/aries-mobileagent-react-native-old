import { PermissionsAndroid } from 'react-native'

import * as AgentErrors from '../errors'
import {Literal, Static, Union} from 'runtypes'
import { WalletName, WalletPassword } from '../agent/agent'

import libIndy from './libIndy'

export const StorageType = Union(
    Literal('LibIndyNonSecrets'),
    //Literal('CouchDB')
)
export type StorageType = Static<typeof StorageType>



export interface WalletInterface {
    createWallet(storageType:StorageType, walletName:WalletName, walletPassword:WalletPassword):Promise<void>,
}

class Wallet implements WalletInterface {
	constructor() {
    }
    
    //(JamesKEbert)TODO: Identify a better strategy for dependency injection/plugable modules/usage of modules dynamically
    /**
     * Get the storage implementation by storage type
     * @param storageType The storage implementation requested
     * @returns any - Any Wallet Implementation
     * @throws WalletError
     */
    _getStorageImplementation(storageType:StorageType):any{
        switch(storageType){
            case "LibIndyNonSecrets":
                return libIndy
            default:
                throw new Error();
        }
    }


    /**
     * Check if the storage permissions have been enabled, if not, ask for permission
     * @returns Promise<void>
     * @throws AgentError
     */
    async _storagePermissions():Promise<void>{
        try {
            console.log('Testing if storage permssions have been granted...')
        
            const permissionsGranted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            )
        
            if (permissionsGranted) {
                console.log('Storage Permissions granted.')
                return
            } 
            else {
                console.log('Storage permssions not granted, requesting...')
            
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                    title: 'Mobile Agent Storage Permission',
                    message:
                        'The App needs access to your storage ' +
                        'so it can store your credentials.',
                    buttonPositive: 'OK',
                    },
                )
            
                console.log(`User response: ${granted}`)
            
                //TODO(JamesKEbert): add handling for if they selected never ask again
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage Permissions granted.')
                    return
                } 
                else {
                    throw new Error('Storage Permissions not Granted')
                }
            }
        } catch (err) {
            throw err
        }
    }


    /**
     * Create a wallet
     * @param storageType The storage mechanism to use
     * @param walletName The wallet name
     * @param walletPassword The wallet password
     * @returns Promise<void>
     * @throws WalletError
     */
    async createWallet(storageType:StorageType, walletName:WalletName, walletPassword:WalletPassword):Promise<void>{
        console.log("Creating Wallet")

        await this._storagePermissions();

        await this._getStorageImplementation(storageType).createWallet(walletName, walletPassword);

        console.log("Wallet Created")
    }
}

export default new Wallet()