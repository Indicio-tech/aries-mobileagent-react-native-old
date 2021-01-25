import { Static, Union, Literal, Record, String } from 'runtypes'
import { UUID } from '../utils/types'

export const StorageName = String
export type StorageName = Static<typeof StorageName>

export const StoragePassword = String
export type StoragePassword = Static<typeof StoragePassword>

export const RecordType = String
export type RecordType = Static<typeof RecordType>

export const RecordID = String
export type RecordID = Static<typeof RecordID>

export const DefaultTags = Record({})
export type DefaultTags = Static<typeof DefaultTags>

export const MessageTags = Record({
    connectionID: UUID,
})
export type MessageTags = Static<typeof MessageTags>

export const ValidTags = Union(
    DefaultTags,
    MessageTags
)
export type ValidTags = Static<typeof ValidTags>

export const StorageRecord = Record({
    type:RecordType,
    id:RecordID,
    content:Record({}),
    tags:ValidTags
})
export type StorageRecord = Static<typeof StorageRecord>

export const RecordRetrievalOptions = Record({
    retrieveType:Union(Literal(true), Literal(false)),
    retrieveValue:Union(Literal(true), Literal(false)),
    retrieveTags:Union(Literal(true), Literal(false)),
})
export type RecordRetrievalOptions = Static<typeof RecordRetrievalOptions>

export default interface StorageServiceInterface {
    storageServiceType:string,
    /**
     * Store a Record
     * 
     */
    storeRecord(
        storageName:StorageName, 
        storagePassword:StoragePassword, 
        record:StorageRecord
    ):Promise<void>,
    
    /**
     * Retrieve a record by ID and type
     */
    retrieveRecord(
        storageName:StorageName, 
        storagePassword:StoragePassword, 
        recordType:RecordType,
        recordID:RecordID,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<StorageRecord>,
    //searchRecords(),
}