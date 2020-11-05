//Encode and decode Base64
export const decodeBase64 = function(encodedMessage:string):string {
    return Buffer.from(encodedMessage, 'base64').toString('ascii')
}
  
export const encodeBase64 = function(message:string):string {
    return Buffer.from(message).toString('base64')
}