import AgentInterface, { WalletName, WalletPassword } from './agentInterface'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'

export default class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:WalletPassword

    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface

    constructor(
        walletName:WalletName,
        walletPassword:WalletPassword, 
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface
    ) {
        console.info("Adding Agent Dependencies")

        this.#walletName = walletName
        this.#walletPassword = walletPassword

        this.#walletService = walletService
        this.#storageService = storageService
    }

    async startup():Promise<void> {
        const startTime = Date.now()

        console.info("Starting AMA-RN Agent")

        //Open Wallet
        await this.#walletService.openWallet(this.#walletName, this.#walletPassword)
        
        //Retrieve configured default ledger name
        let defaultLedger:any = await this.#storageService.retrieveRecord(
            this.#walletName, 
            this.#walletPassword,
            "ledgerConfig",
            `${this.#walletName}-default`,
            {
                retrieveType: true,
                retrieveValue: true,
                retrieveTags: true
            }
        )

        //Open Pool
        await this.#walletService.openLedger(defaultLedger.content.configName)

        //Check governance framework(s) caching rules, pull if needed
        
        //Pickup messages from mediator(s)

        const durationTime = Date.now() - startTime
        console.info(`Finished AMA-RN Agent Startup, took ${durationTime} milliseconds`)
    }
}