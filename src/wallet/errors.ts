import AgentError from '../errors/agentError'

export default class WalletError extends AgentError{
    constructor(parameter:string, validationMessage:string|null = null, ...params:any[]) {
        super(4, 'WalletError', ...params)

        if(typeof parameter !== "string"){
            throw new Error("Error Constructor received invalid parameter parameter")
        }

        this.message = `Code ${this.code} - WalletError: Invalid parameter '${parameter}'${(validationMessage)?(', ' + validationMessage):('')}`
    }
}

export class IndyError extends AgentError{
    indyErrorCode:string

    constructor(indyMessage:any, ...params:any[]) {
        super(5, 'IndyError', ...params)
        
        const parsedIndyMessage = JSON.parse(indyMessage)
        this.message = `Code ${this.code} - IndyError: '${parsedIndyMessage.code}' - ${parsedIndyMessage.message}`
        this.indyErrorCode = parsedIndyMessage.code
    }
}