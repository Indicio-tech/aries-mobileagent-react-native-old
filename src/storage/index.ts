import { Static, Union, Literal, Record, Boolean, String } from 'runtypes'
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
    retrieveType: Boolean,
    retrieveValue: Boolean,
    retrieveTags: Boolean,
})
export type RecordRetrievalOptions = Static<typeof RecordRetrievalOptions>

export const RecordSearchQuery = Record({})
export type RecordSearchQuery = Static<typeof RecordSearchQuery>

export const RecordSearchOptions = Record({
    retrieveRecords: Boolean,
    retrieveTotalCount: Boolean,
    retrieveType: Boolean,
    retrieveValue: Boolean,
    retrieveTags: Boolean,
})
export type RecordSearchOptions = Static<typeof RecordSearchOptions>

export default interface StorageServiceInterface {
    storageServiceType:string,
    
    /**
     * Store a Record
     * 
     */
    storeRecord(
        record:StorageRecord
    ):Promise<void>,
    
    /**
     * Retrieve a record by ID and type
     */
    retrieveRecord(
        recordType:RecordType,
        recordID:RecordID,
        retrievalOptions:RecordRetrievalOptions
    ):Promise<StorageRecord>,
    
    /**
     * Search for records
     * @param recordType 
     * @param query 
     * @param retrievalOptions 
     * @param count 
     */
    searchRecords(
        recordType: RecordType,
        query: RecordSearchQuery,
        retrievalOptions:RecordSearchOptions,
        count:number
    ):Promise<Array<StorageRecord>>

    /**
     * Update a Record
     * 
     */
    updateRecord(
        recordType:string,
        recordID:string,
        recordValue:{},
    ):Promise<void>,

    /**
     * Add tags to a record
     * @param recordType 
     * @param recordID 
     * @param recordTags 
     */
    addTagsToRecord(
        recordType:string,
        recordID:string,
        recordTags:{},
    ):Promise<void>
}