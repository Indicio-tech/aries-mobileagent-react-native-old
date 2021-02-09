import {DeviceEventEmitter} from 'react-native'
var EventEmitter = require('events')
import WSInterface from './wsInterface'

class WS implements WSInterface {
  webSocketHandlers: {[endpoint: string]: WebSocket} = {}
  webSocketCloseEvents: typeof EventEmitter = new EventEmitter()

  constructor() {
    console.info('Starting WebSockets Transport')
  }

  async _addWebSocketHandler(
    endpoint: string,
    messageBuffer: Buffer,
    inboundMessagesCallback: Function,
  ): Promise<void> {
    console.info('Creating new WebSocket Handler')

    this.webSocketHandlers[endpoint] = new WebSocket(endpoint)

    this.webSocketHandlers[endpoint].onerror = async (error) => {
      throw new Error(`${endpoint} - WebSocket Handler Error`)
    }

    this.webSocketHandlers[endpoint].onopen = async () => {
      console.info(`${endpoint} - WebSocket Handler opened, sending message`)

      await this.webSocketHandlers[endpoint].send(messageBuffer)
    }

    this.webSocketHandlers[endpoint].onmessage = async (wsMessage) => {
      console.info(`${endpoint} - New WebSocket message`)

      const message = JSON.parse(Buffer.from(wsMessage.data).toString('utf-8'))

      await inboundMessagesCallback(message)
    }

    this.webSocketHandlers[endpoint].onclose = async (closeEvent) => {
      console.info(
        `${endpoint} - WebSocket Handler closed with closeEvent:`,
        closeEvent,
      )

      this.webSocketCloseEvents.emit('handler-closed', endpoint)

      delete this.webSocketHandlers[endpoint]
    }
  }

  async sendOutboundMessage(
    messageBuffer: Buffer,
    endpoint: string,
    inboundMessagesCallback: Function,
  ): Promise<void> {
    console.info(`Sending a message via WebSockets to ${endpoint}`)

    if (this.webSocketHandlers[endpoint]) {
      await this.webSocketHandlers[endpoint].send(messageBuffer)
    } else {
      await this._addWebSocketHandler(
        endpoint,
        messageBuffer,
        inboundMessagesCallback,
      )
    }
  }
}

export default new WS()
