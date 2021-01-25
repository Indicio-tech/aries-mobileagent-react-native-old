import storagePermissions from '../permissions'

import AgentInterface, { WalletName, WalletPassword, MasterSecretID } from './agentInterface'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'

import ConnectionsManager from './connectionsManager/connectionsManager'
import { InboundMessageHandler } from './messages'

//Protocols
import ConnectionsHandler from './protocols/connections/connections'

export default class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:WalletPassword
    #masterSecretID:MasterSecretID

    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    #connectionManager:ConnectionsManager
    #inboundMessageHandler:InboundMessageHandler

    #protocolHandlers:Array<any>

    constructor(
        walletName:WalletName,
        walletPassword:WalletPassword, 
        masterSecretID:MasterSecretID,
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface
    ) {
        console.info("Adding Agent Dependencies")

        this.#walletName = walletName
        this.#walletPassword = walletPassword
        this.#masterSecretID = masterSecretID

        this.#walletService = walletService
        this.#storageService = storageService

        this.#connectionManager = new ConnectionsManager(
            this.#walletService,
            this.#storageService
        )
        
        this.#inboundMessageHandler = new InboundMessageHandler()

        //Register Protocol Handlers
        let i = 0;
        this.#protocolHandlers = []
        this.#protocolHandlers[i] = new ConnectionsHandler(this.#inboundMessageHandler)
        
        this.#inboundMessageHandler.register(
            this.#protocolHandlers[i].inboundMessage,
            this.#protocolHandlers[i].protocolURI
        )
        //this.#protocolHandlers[i++] = new 
        

    }

    async startup():Promise<void> {
        const startTime = Date.now()

        console.info("Starting AMA-RN Agent")

        //Check Storage Permissions
        await storagePermissions()

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