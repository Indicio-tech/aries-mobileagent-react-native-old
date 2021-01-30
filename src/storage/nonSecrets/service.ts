import StorageServiceInterface, { StorageName, StoragePassword, RecordType, RecordID, StorageRecord, RecordRetrievalOptions, RecordSearchOptions, RecordSearchQuery } from '../index'

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

    async searchRecords(
        storageName:StorageName, 
        storagePassword:StoragePassword, 
        recordType: RecordType,
        query: RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number = 100
    ):Promise<Array<StorageRecord>> {
        try{
            console.info(`Searching Records by query`, query, `and type ${recordType}`)

            if(!this.#walletService.searchRecords){
                throw new Error("searchRecords() Not Implemented")
            }

            const nonSecretsRecords:string = await this.#walletService.searchRecords(
                storageName,
                storagePassword,
                recordType,
                JSON.stringify(query),
                JSON.stringify(retrievalOptions),
                count
            )
            
            console.info("Processing Record Search Results")

            let parsedNonSecretsRecords = JSON.parse(nonSecretsRecords)
            let processedRecords:Array<StorageRecord> = []

            if(parsedNonSecretsRecords.records)
            {
                for(var i = 0; i < parsedNonSecretsRecords.records.length; i++){
                    let record = parsedNonSecretsRecords.records[i]
                    processedRecords[i] = {
                        type: record.type,
                        id: record.id,
                        content: JSON.parse(record.value),
                        tags: record.tags
                    }
                }
            }

            console.info("Retrieved Records:", processedRecords)
            return processedRecords
        } catch (error){
            throw error
        }
    }
}