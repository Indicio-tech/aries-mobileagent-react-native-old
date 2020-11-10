//For UUIDv4 within React Native
import 'react-native-get-random-values'
import { NativeModules } from 'react-native'
const RNFS = require('react-native-fs')
global.Buffer = global.Buffer || require('buffer').Buffer
import {v4 as uuidv4} from 'uuid'
import url from 'url'
import axios from 'axios'
//Libindy Native Bridging
const {Indy} = NativeModules

class Agent {
	constructor() {		
		console.log("Testing!", RNFS.DocumentDirectoryPath);
		console.log("Howdy",Indy );
	}
}


export default Agent