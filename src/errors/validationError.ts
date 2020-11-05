import AgentError from './agentError'

export default class ValidationError extends AgentError{
    constructor(parameter:string, validationMessage:string|null = null, ...params:any[]) {
        super(3, 'ValidationError', ...params)

        if(typeof parameter !== "string"){
            throw new Error("Error Constructor received invalid parameter parameter")
        }

        this.message = `Code ${this.code} - ValidationError: Invalid parameter '${parameter}'${(validationMessage)?(', ' + validationMessage):('')}`
    }
}