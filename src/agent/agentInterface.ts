import {Static, Record, String} from 'runtypes'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export default interface AgentInterface {
  /**
   * Starts and loads up the agent, may not be required after creation
   * @returns promise of void
   */
  startup(): Promise<void>
}
