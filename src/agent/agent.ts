import storagePermissions from '../permissions'

//Wallet Dependencies
import WalletService from '../wallet/indy'

//Storage Dependencies
import StorageService from '../storage/nonSecrets'

import InboundMessageHandler from './inboundMessages/inboundHandler'
import OutboundMessageHandler from './outboundMessages/outboundHandler'

//Services
import ConnectionsService from './services/connections/connectionsService'
import MediationService from './services/mediation/mediationService'

//Base Protocol Handlers
import ProtocolHandlerInterface from './protocols/baseProtocolHandler'

//Protocols
import ConnectionsHandler from './protocols/connections/connections'
import TrustPingHandler from './protocols/trustPing/trustPing'
import CoordinateMediationHandler from './protocols/coordinateMediation/coordinateMediation'

import AgentInterface, { WalletName, WalletPassword, MasterSecretID } from './agentInterface'

export default class Agent implements AgentInterface {
    #walletName:WalletName
    #walletPassword:WalletPassword
    #masterSecretID:MasterSecretID

    #services: {
        [serviceIdentifiers:string]: Object
    } = {
        inboundMessageHandler: InboundMessageHandler,
        outboundMessageHandler: OutboundMessageHandler,
        connectionService: ConnectionsService,
        mediationService: MediationService,
    }

    #protocolHandlers:{
        [handlerIdentifiers:string]: ProtocolHandlerInterface
    } = {
        [ConnectionsHandler.handlerIdentifier]: ConnectionsHandler,
        [TrustPingHandler.handlerIdentifier]: TrustPingHandler,
        [CoordinateMediationHandler.handlerIdentifier]: CoordinateMediationHandler,
    }


    mediation:typeof MediationService.adminAPI = MediationService.adminAPI
    connections:typeof ConnectionsService.adminAPI = ConnectionsService.adminAPI
    
    constructor(
        walletName:WalletName,
        walletPassword:WalletPassword, 
        masterSecretID:MasterSecretID,
    ) {
        console.info("Loading Agent Dependencies")
        //Store Agent Auth details
        this.#walletName = walletName
        this.#walletPassword = walletPassword
        this.#masterSecretID = masterSecretID

        ConnectionsHandler.registerMessages(ConnectionsHandler.messageCallbacks)
        TrustPingHandler.registerMessages(TrustPingHandler.messageCallbacks)
        CoordinateMediationHandler.registerMessages(CoordinateMediationHandler.messageCallbacks)
    }

    async startup():Promise<void> {
        const startTime = Date.now()

        console.info("Starting AMA-RN Agent")

        //Check Storage Permissions
        await storagePermissions()

        //Open Wallet
        await WalletService.openWallet(this.#walletName, this.#walletPassword)
        
        //Open the storage JamesKEbert TODO
        
        //Retrieve configured default ledger name
        let defaultLedger:any = await StorageService.retrieveRecord(
            "ledgerConfig",
            `${this.#walletName}-default`,
            {
                retrieveType: true,
                retrieveValue: true,
                retrieveTags: true
            }
        )

        //Open Pool
        await WalletService.openLedger(defaultLedger.content.configName)

        //Check governance framework(s) caching rules, pull if needed

        //Pickup messages from mediator(s)

        const durationTime = Date.now() - startTime
        console.info(`Finished AMA-RN Agent Startup, took ${durationTime} milliseconds`)
    }
}