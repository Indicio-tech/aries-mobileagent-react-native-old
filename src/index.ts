//For UUIDv4 within React Native
import 'react-native-get-random-values'
import {v4 as uuidv4} from 'uuid'
//For Global Buffer usage
global.Buffer = global.Buffer || require('buffer').Buffer

import Agent from './agent'

//Wallet Dependencies
import WalletService from './wallet/indy'

//Storage Dependencies
import StorageService from './storage/nonSecrets'

import AMARNInterface, {
  AgentConfig,
  MasterSecretID,
  WalletName,
  WalletPassword,
} from './interface'

class AMARN implements AMARNInterface {
  constructor() {
    try {
      console.info(`Loading AMA-RN`)
    } catch (error) {
      throw new Error('Failed to Start AMARN')
    }
  }

  created(): boolean {
    throw Error('Not Implemented')
  }

  async generateMasterSecretID(): Promise<MasterSecretID> {
    console.info('Generating Master Secret ID')

    return await WalletService.generateMasterSecretID()
  }

  async createAgent(creationParameters: AgentConfig): Promise<Agent> {
    const startTime = Date.now()

    console.info('Creating Agent')
    console.log('Creating Agent with parameters: ', creationParameters)

    //Validate Creation parameters
    AgentConfig.check(creationParameters)
    
    //Perform creation
    try {
      await WalletService.createWallet(
        creationParameters.walletName,
        creationParameters.walletPassword,
        creationParameters.masterSecretID,
        creationParameters.ledgerConfig.name,
        creationParameters.ledgerConfig.genesisString,
      )

      //Open the storage JamesKEbert TODO

      //Store the pool configuration name
      await StorageService.storeRecord({
        type: 'ledgerConfig',
        id: `${creationParameters.walletName}-default`, //JamesKEbert TODO: Replace default ID with multi-ledger functionality
        content: {
          configName: creationParameters.ledgerConfig.name,
        },
        tags: {
          default: 'true',
        },
      })

      //Create Agent Object
      const agent = new Agent(
        creationParameters.walletName,
        creationParameters.walletPassword,
        creationParameters.masterSecretID,
      )

      await agent.startup()

      //Fetch governance framework

      //Initiate Mediation connection
      if (creationParameters.defaultMediatorConfig) {
        await agent.mediation.addMediator(
          creationParameters.defaultMediatorConfig.invite,
          creationParameters.defaultMediatorConfig.mediatorID,
        )
      }

      const durationTime = Date.now() - startTime
      console.info(`Finished Agent Creation, took ${durationTime} milliseconds`)

      return agent
    } catch (error) {
      throw error
    }
  }

  async loadAgent(
    walletName: WalletName,
    walletPassword: WalletPassword,
    masterSecretID: MasterSecretID,
  ): Promise<Agent> {
    console.info('Loading Agent')

    //Validate Loading parameters
    WalletName.check(walletName)
    WalletPassword.check(walletPassword)
    MasterSecretID.check(masterSecretID)

    //Create Agent Object
    const agent = new Agent(walletName, walletPassword, masterSecretID)

    await agent.startup()

    return agent
  }
}

export default new AMARN()
