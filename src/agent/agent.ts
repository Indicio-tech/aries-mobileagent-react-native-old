import storagePermissions from '../permissions'

import AgentInterface, { WalletName, WalletPassword, MasterSecretID } from './agentInterface'

//Storage Dependencies
import StorageServiceInterface from '../storage'

//Wallet Dependencies
import WalletServiceInterface from '../wallet'

import ConnectionsService from './services/connections/connectionsService'
import MediationService from './services/mediation/mediationService'
import DIDService from './services/dids/didService'
import { InboundMessageHandler } from './messages'

import ProtocolHandlerInterface from './protocols/protocolHandlerInterface'

//Protocols
import ConnectionsHandler from './protocols/connections/connections'

export default class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:WalletPassword
    #masterSecretID:MasterSecretID

    #walletService:WalletServiceInterface
    #storageService:StorageServiceInterface
    #inboundMessageHandler:InboundMessageHandler
    connectionsService:ConnectionsService
    #DIDService:DIDService
    mediationService:MediationService

    #protocolHandlers:{
        [handlerIdentifiers:string]: ProtocolHandlerInterface
    } = {}

    constructor(
        walletName:WalletName,
        walletPassword:WalletPassword, 
        masterSecretID:MasterSecretID,
        walletService:WalletServiceInterface,
        storageService:StorageServiceInterface
    ) {
        console.info("Adding Agent Dependencies")

        //Add/Create Services
        this.#walletName = walletName
        this.#walletPassword = walletPassword
        this.#masterSecretID = masterSecretID

        this.#walletService = walletService
        this.#storageService = storageService
        this.#inboundMessageHandler = new InboundMessageHandler()

        this.#DIDService = new DIDService(
            this.#walletService,
            this.#walletName,
            this.#walletPassword
        )
        this.connectionsService = new ConnectionsService(
            this.#walletService,
            this.#storageService,
            this.#walletName,
            this.#walletPassword,
            this.#DIDService
        )
        this.mediationService = new MediationService(this.connectionsService)

        //Create Protocol Handlers
        const handlersList:Array<any> = [ConnectionsHandler] //JamesKEbert TODO: Fix constant type
        for(var i = 0; i < handlersList.length; i++){
            const protocolHandler:ProtocolHandlerInterface = new handlersList[i](this.#inboundMessageHandler, this.connectionsService)
            this.#protocolHandlers[protocolHandler.handlerIdentifier] = protocolHandler
        }

        //Register Protocols as needed with services
        //JamesKEbert TODO: perform this registration process from the service side, which will help in abstraction/service plugin capabilities
        this.connectionsService.registerProtocolHandlers(this.#protocolHandlers["connections-1.0"])
        //this.mediationService No protocols to register
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