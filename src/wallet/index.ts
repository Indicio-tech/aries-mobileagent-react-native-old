export default interface WalletServiceInterface {
    walletServiceType:string
    //Record Storage mechanisms should be able to throw notImplemented
}

export interface WalletServiceConstructorInterface {
    new(): WalletServiceInterface
}