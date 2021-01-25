import StorageServiceInterface, { StorageName, StoragePassword, RecordType, RecordID, StorageRecord, RecordRetrievalOptions } from '../index'

import WalletServiceInterface from '../../wallet'


//(JamesKEbert)TODO: Abstract into separate repo or project potentially

export default class NonSecretsService implements StorageServiceInterface {
    storageServiceType:string = "NonSecrets"
    #walletService:WalletServiceInterface

    constructor(walletService:WalletServiceInterface){
        console.info("Created NonSecretsService")

        this.#walletService = walletService
    }

    async storeRecord(
        storageName:StorageName, 
        storagePassword:StoragePassword, 
        record:StorageRecord
    ):Promise<void> {
        console.info(`Storing record with ID ${record.id}`)

        if(!this.#walletService.storeRecord){
            throw new Error("storeRecord() Not Implemented")
        }

        await this.#walletService.storeRecord(
            storageName,
            storagePassword,
            {
                type: record.type,
                id: record.id,
                content: JSON.stringify(record.content),
                tags: JSON.stringify(record.tags)
            }
        )
    }

    async retrieveRecord(
        storageName:StorageName, 
        storagePassword:StoragePassword, 
        recordType:RecordType,
        recordID:RecordID,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<StorageRecord> {
        try{
            console.info(`Retrieving Record by ID ${recordID} and type ${recordType}`)

            if(!this.#walletService.getRecord){
                throw new Error("getRecord() Not Implemented")
            }

            const nonSecretsRecord = await this.#walletService.getRecord(
                storageName,
                storagePassword,
                recordType,
                recordID,
                JSON.stringify(retrievalOptions)
            )
            
            let processedRecord = JSON.parse(nonSecretsRecord);
            processedRecord = {
                type: processedRecord.type,
                id: processedRecord.id,
                content: JSON.parse(processedRecord.value),
                tags: processedRecord.tags
            }

            console.info("Retrieved Record:", processedRecord)
            return processedRecord
        } catch (error){
            throw error
        }
    }
}