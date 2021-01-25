import { PermissionsAndroid } from 'react-native'

/**
 * Check if the storage permissions have been enabled, if not, ask for permission
 * @returns Promise<void>
 * @throws AgentError
 */
export default async function storagePermissions():Promise<void> {
    try {
        const permissionsGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        )
    
        if (permissionsGranted) {
            return
        } 
        else {
            console.log('Storage permssions not granted, requesting...')
        
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                title: 'Mobile Agent Storage Permissions',
                message:
                    'The mobile agent needs access to your storage ' +
                    'so it can store your wallet and credentials.',
                buttonPositive: 'Ok',
                },
            )
        
            console.log(`User response: ${granted}`)
        
            //TODO(JamesKEbert): add handling for if they selected never ask again
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Storage Permissions granted.')
                return
            } 
            else {
                throw new Error('Storage Permissions not Granted')
            }
        }
    } catch (err) {
        throw err
    }
}