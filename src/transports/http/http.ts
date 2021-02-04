import axios from 'axios'
import HTTPInterface from "./httpInterface";


class HTTP implements HTTPInterface {
    constructor(){
        console.info("Starting HTTP Transport")
    }

    async sendOutboundMessage(messageBuffer:Buffer, endpoint:string, inboundCallback:Function):Promise<void> {
        console.info(`Sending a message via HTTP to ${endpoint}`)

        const message:string = Buffer.from(messageBuffer).toString('utf-8')
        
        const response = await axios.post(endpoint, message)
        
        
        await inboundCallback(response.data)
    }
}

export default new HTTP()