export default class AgentError extends Error {
    code:number = 0
    constructor(code:number = 0, message:string = '', ...params:any[]) {
        super(...params)
    
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AgentError)
        }
    
        if(typeof code !== "number"){
            throw new Error("Error Constructor received invalid code parameter")
        }
        if(typeof message !== "string"){
            throw new Error("Error Constructor received invalid message parameter")
        }

        this.name = 'AgentError'
        this.code = code
        this.message = message
    }
}