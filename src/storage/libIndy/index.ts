import { PermissionsAndroid } from 'react-native'

import { StorageServiceInterface } from '../index'
import { WalletServiceInterface } from '../../wallet'
import * as AgentErrors from '../../errors'

//(JamesKEbert)TODO: Abstract into separate repo or project?

export default class LibIndyStorageService implements StorageServiceInterface {
    _walletService:WalletServiceInterface

    constructor(walletService:WalletServiceInterface){
        this._walletService = walletService
    }
}