import { v4 as uuidv4 } from 'uuid'

import * as AgentErrors from '../../errors'

import storagePermissions from './permissions'

import WalletServiceInterface, {WalletName, WalletPassword, MasterSecretID, LedgerConfigName, LedgerGenesisString} from '../index'

import IndyConnection from './connection/indy'
import IndyInterface from './connection/indyInterface'

//(JamesKEbert)TODO: Abstract into separate repo or project potentially

export default class IndyService implements WalletServiceInterface {
    walletServiceType:string = "Indy"
    #indy:IndyInterface

    constructor(){
        console.info(`Created IndyService`)
        this.#indy = new IndyConnection()
    }

    async createWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword, 
        masterSecretID: MasterSecretID,
        ledgerConfigName:LedgerConfigName,
        ledgerGenesisString:LedgerGenesisString
    ):Promise<void> {
        console.info("Creating Wallet")
        
        //Check Permissions
        await storagePermissions()

        //Create the wallet
        await this.#indy.createWallet(walletName, walletPassword)

        //Create the master secret ID
        await this.#indy.createMasterSecretID(walletName, walletPassword, masterSecretID)

        //Create the pool configuration
        await this.#indy.createPoolLedgerConfig(ledgerConfigName, ledgerGenesisString)

        //Open the pool
        await this.#indy.checkPool(ledgerConfigName, null)

        //Store the pool configuration name
        

        //Create Agent Object

        return
    }

    async generateMasterSecretID():Promise<MasterSecretID> {
        return uuidv4()
    }
}