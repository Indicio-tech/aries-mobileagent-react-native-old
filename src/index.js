import { NativeModules } from 'react-native'

//Libindy Native Bridging
const {Indy} = NativeModules

class Agent {
	constructor() {		
		console.log("Testing!");
		console.log("Howdy",Indy );
	}
}


export default Agent