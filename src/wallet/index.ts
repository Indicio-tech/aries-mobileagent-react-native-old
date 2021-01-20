export interface WalletServiceConstructorInterface {
    new(): WalletServiceInterface
}

export default interface WalletServiceInterface {
    walletServiceType:string,
    //Record Storage mechanisms should be able to throw notImplemented
    /**
     * Create Wallet
     */
    test(argument:String):void,
    createWallet():Promise<void>,
    //checkWallet():Promise<boolean>,
    //openWallet():Promise<void>,
}