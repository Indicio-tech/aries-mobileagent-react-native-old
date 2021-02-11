import {v4 as uuidv4} from 'uuid'

import {
  Connection,
  ConnectionID,
} from '../../services/connections/connectionsServiceInterface'
import OutboundMessageHandler from '../../outboundMessages/outboundHandler'

import {
  MediateRequestMessage,
  MediateGrantMessage,
  KeylistUpdate,
  KeylistUpdateMessage,
  KeylistUpdateResponse,
} from './messages'

import BaseProtocolHandler from '../baseProtocolHandler'
import CoordinateMediationHandlerInterface from './coordinateMediationInterface'
import MediationService from '../../services/mediation/mediationService'

class CoordinateMediationHandler
  extends BaseProtocolHandler
  implements CoordinateMediationHandlerInterface {
  messageCallbacks = {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/mediate-deny': this.receiveMediationDeny.bind(
      this,
    ),
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/mediate-grant': this.receiveMediationGrant.bind(
      this,
    ),
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/keylist-update-response': this.receiveKeylistUpdateResponse.bind(
      this,
    ),
  }

  constructor() {
    super('coordinate-mediation-1.0')
  }

  async sendMediationRequest(connectionID: ConnectionID): Promise<void> {
    const mediationRequest: MediateRequestMessage = {
      '@type':
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/mediate-request',
      '@id': uuidv4(),
      mediator_terms: [],
      recipient_terms: [],
      '~transport': {
        return_route: 'all',
      },
    }

    console.info('Sending request mediation message', mediationRequest)

    //Validate message
    MediateRequestMessage.check(mediationRequest)

    await OutboundMessageHandler.sendMessageByConnectionID(
      connectionID,
      mediationRequest,
    )
  }

  async receiveMediationDeny(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void> {
    throw new Error('Mediation Denied')
  }

  async receiveMediationGrant(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void> {
    console.info(
      `Received Mediation Grant from Mediator ${connection.mediatorID}`,
    )

    MediateGrantMessage.check(unpackedMessage.message)

    await MediationService.mediationGranted(
      connection,
      unpackedMessage.message.endpoint,
      unpackedMessage.message.routing_keys,
    )
  }

  async sendKeylistUpdate(
    connectionID: ConnectionID,
    keylistUpdates: KeylistUpdate[] = [],
  ): Promise<void> {
    const keylistUpdateMessage: KeylistUpdateMessage = {
      '@type':
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/keylist-update',
      '@id': uuidv4(),
      updates: keylistUpdates,
      '~transport': {
        return_route: 'all',
      },
    }

    KeylistUpdateMessage.check(keylistUpdateMessage)

    await OutboundMessageHandler.sendMessageByConnectionID(
      connectionID,
      keylistUpdateMessage,
    )
  }

  async receiveKeylistUpdateResponse(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void> {
    console.info(
      `Received Keylist Update Response from Mediator ${connection.mediatorID}`,
    )

    KeylistUpdateResponse.check(unpackedMessage.message)

    await MediationService.receiveKeylistUpdateResponse(
      connection.mediatorID!,
      unpackedMessage.message.updated,
    )
  }
}

export default new CoordinateMediationHandler()
