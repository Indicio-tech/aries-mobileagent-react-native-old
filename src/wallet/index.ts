import { Static, Record, String } from 'runtypes'

export const WalletName = String
export type WalletName = Static<typeof WalletName>

export const WalletPassword = String
export type WalletPassword = Static<typeof WalletPassword>

export const MasterSecretID = String
export type MasterSecretID = Static<typeof MasterSecretID>

export const LedgerConfigName = String
export type LedgerConfigName = Static<typeof LedgerConfigName>

export const LedgerGenesisString = String
export type LedgerGenesisString = Static<typeof LedgerGenesisString>

export interface WalletServiceConstructorInterface {
    new(): WalletServiceInterface
}

export default interface WalletServiceInterface {
    walletServiceType:string,
    //Record Storage mechanisms should be able to throw notImplemented
    /**
     * Creates the Wallet and configures the Ledger/pool
     * @param walletName The name of the wallet
     * @param walletPassword The password to encrypt the wallet
     * @param masterSecretID The master secret ID of the wallet
     * @param ledgerConfigName The Identifying name of the ledger configuration
     * @param ledgerGenesisString The ledger's genesis file in string format
     * @returns promise of void
     * @throws IndyError
     */
    createWallet(
        walletName:WalletName, 
        walletPassword:WalletPassword,
        masterSecretID:MasterSecretID,
        ledgerConfigName:LedgerConfigName,
        ledgerGenesisString:LedgerGenesisString
    ):Promise<void>,
    /**
     * Generates a Master Secret ID for use in wallet creation
     * @returns promise of MasterSecretID
     */
    generateMasterSecretID():Promise<MasterSecretID>
    //checkWallet():Promise<boolean>,
    //openWallet():Promise<void>,
}