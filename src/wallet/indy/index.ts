import { PermissionsAndroid } from 'react-native'

import { WalletServiceInterface, WalletType } from '../index'
import * as AgentErrors from '../../errors'

//(JamesKEbert)TODO: Abstract into separate repo or project?

export default class IndyService implements WalletServiceInterface {
    walletServiceType:WalletType = "Indy"

    constructor(){
        
    }
}