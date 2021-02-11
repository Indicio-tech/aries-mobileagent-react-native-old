import {v4 as uuidv4} from 'uuid'
import OutboundMessageHandler from '../../outboundMessages/outboundHandler'
import ConnectionsService from '../../services/connections/connectionsService'
import {
  Connection,
  InvitationRecord,
  Service,
} from '../../services/connections/connectionsServiceInterface'
import {DIDDoc} from '../../services/dids/didServiceInterface'

import BaseProtocolHandler from '../baseProtocolHandler'
import ConnectionsHandlerInterface from './connectionsInterface'

import {
  Invitation,
  PublicDIDInvitation,
  ConnectionRequest,
  ConnectionResponse,
} from './messages'

class ConnectionsHandler
  extends BaseProtocolHandler
  implements ConnectionsHandlerInterface {
  messageCallbacks = {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response': this.receiveResponse.bind(
      this,
    ),
  }
  constructor() {
    super('connections-1.0')

    const connectionService = ConnectionsService

    //Should occur here or in the base protocol handler once the dependency injection issues are resolved
    // this.registerMessages({
    //     "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation": this.receiveResponse
    // })
  }

  async processInvitation(invitation: Invitation): Promise<Service> {
    try {
      //Validate Message
      Invitation.check(invitation)

      if (PublicDIDInvitation.guard(invitation)) {
        throw new Error('Public DID Invitations are not currently supported')
      }

      let routingKeys: string[] = []
      if (invitation.routingKeys) {
        routingKeys = invitation.routingKeys
      }

      return {
        recipientKeys: invitation.recipientKeys,
        routingKeys: routingKeys,
        serviceEndpoint: invitation.serviceEndpoint,
      }
    } catch (error) {
      console.log(error)
      throw new Error('Error while processing invitation')
    }
  }

  async sendRequest(
    label: string,
    didDoc: DIDDoc,
    endpoint: string,
    recipientKeys: string[],
    senderVerkey: string,
    routingKeys: string[] = [],
    returnRoute: boolean = false,
  ): Promise<void> {
    console.info('Sending connection request')

    let request: ConnectionRequest = {
      '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request',
      '@id': uuidv4(),
      label: label,
      connection: {
        DID: didDoc.id,
        DIDDoc: didDoc,
      },
    }

    if (returnRoute) {
      request = {
        ...request,
        '~transport': {
          return_route: 'all',
        },
      }
    }

    if (!ConnectionRequest.guard(request)) {
      throw new Error('Connection request was not created correctly')
    }

    console.info('Created Connection Request', request)

    await OutboundMessageHandler.sendMessage(
      endpoint,
      request,
      recipientKeys,
      senderVerkey,
      routingKeys,
    )
  }

  async receiveResponse(
    unpackedMessage: any,
    connection: Connection,
  ): Promise<void> {
    console.info(
      'Received new connection response',
      unpackedMessage,
      connection,
    )

    ConnectionResponse.check(unpackedMessage.message)

    //Retrieve the connection invitation
    const invitation: InvitationRecord = await ConnectionsService.getInvitationRecord(
      connection.invitationID,
    )

    //Check if the response match the invitation recipient verkey
    let matching: boolean = false
    for (var i = 0; i < invitation.service.recipientKeys.length; i++) {
      if (
        invitation.service.recipientKeys[i] ===
        unpackedMessage.message['connection~sig'].signer
      ) {
        matching = true
        break
      }
    }
    if (!matching) {
      throw new Error('Response does not match the invitation recipient verkey')
    }

    await ConnectionsService.receiveResponse(
      unpackedMessage.message.connection.DIDDoc,
      connection,
    )
  }
}

export default new ConnectionsHandler()
