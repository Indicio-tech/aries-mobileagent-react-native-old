import { PermissionsAndroid } from 'react-native'
import {Static, Literal, Union} from 'runtypes'

import * as AgentErrors from '../errors'
import {WalletServiceInterface} from '../wallet'
import LibIndyStorageService from './libIndy'


export interface StorageServiceInterface {
    
}

export interface StorageServiceConstructorInterface {
    new(): StorageServiceInterface
}


//Default AMA-RN loaded Storage Services
export const StorageType = Union(
    Literal('LibIndyNonSecrets')
)
export type StorageType = Static<typeof StorageType>



//(JamesKEbert)TODO: Add the capability to pass an external service
/**
 * Creates the Storage Service. Validates the StorageType passed and returns the created Storage Service
 * @param storageService The type of Storage Service. Must be a StorageType
 * @param walletService An optional Wallet Service instance. Used for some storage implementations
 * @returns StorageServiceInterface - An instance of a Storage Service
 * @throws ValidationError - AgentErrors.ValidationError
 * @throws Error - AgentErrors.Error
 */
export default function createStorageService(storageService:StorageType, walletService?:WalletServiceInterface):StorageServiceInterface{
    console.log("Creating Storage Service")

    if(!StorageType.guard(storageService)){
        throw new AgentErrors.ValidationError("storageService")
    }

    switch (storageService) {
        case 'LibIndyNonSecrets':
            if(walletService){
                if(walletService.walletServiceType === "Indy"){
                    return new LibIndyStorageService(walletService)
                }
            }
            throw new AgentErrors.Error(0, "LibIndyNonSecrets Storage requires the Indy Wallet Service to be used")
        default:
            throw new AgentErrors.Error(0, "Unidentified Wallet Service")
    }
}