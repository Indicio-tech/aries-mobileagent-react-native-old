import { PermissionsAndroid } from 'react-native'

import * as AgentErrors from '../../errors'

import WalletServiceInterface from '../index'

import Indy, {IndyInterface} from './indy'

//(JamesKEbert)TODO: Abstract into separate repo or project potentially

export default class IndyService implements WalletServiceInterface {
    walletServiceType:string = "Indy"
    //#indy:IndyInterface

    constructor(){
        console.info(`Created IndyService`)
        //this.#indy = new Indy()
    }

    async createWallet():Promise<void> {
        console.info("Creating Wallet")
        return
    }

    test(argument:String):void{
        console.log(argument)
        return
    }
}