import { PermissionsAndroid } from 'react-native'
import {Static, Literal, Union} from 'runtypes'

import * as AgentErrors from '../errors'
import IndyService from './libindy'


export interface WalletServiceInterface {
    
}

export interface WalletServiceConstructorInterface {
    new(): WalletServiceInterface
}


//Default AMA-RN loaded Wallet Services
export const WalletType = Union(
    Literal('Indy')
)
export type WalletType = Static<typeof WalletType>



//(JamesKEbert)TODO: Add the capability to pass an external service
/**
 * Creates the Wallet Service. Validates the WalletType passed and returns the created Wallet Service
 * @param walletService The type of wallet service. Must be a WalletType
 * @returns WalletServiceInterface - An instance of a Wallet Service
 * @throws ValidationError - AgentErrors.ValidationError
 * @throws Error - AgentErrors.Error
 */
export default function createWalletService(walletService:WalletType):WalletServiceInterface{
    console.log("Creating Wallet Service")

    if(!WalletType.guard(walletService)){
        throw new AgentErrors.ValidationError("walletService")
    }

    switch (walletService) {
        case 'Indy':
            return new IndyService()
        default:
            throw new AgentErrors.Error(0, "Unidentified Wallet Service")
    }
}