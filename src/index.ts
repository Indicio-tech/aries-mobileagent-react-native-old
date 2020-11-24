//For UUIDv4 within React Native
import 'react-native-get-random-values'
import { NativeModules } from 'react-native';
import { v4 as uuidv4 } from 'uuid'
import url from 'url'
import axios from 'axios'

const RNFS = require('react-native-fs')
global.Buffer = global.Buffer || require('buffer').Buffer



//Libindy Native Bridging
const {Indy} = NativeModules

import {AgentBuilder, DefaultAgentDirector} from './agent'

const Aries = {
    AgentBuilder: AgentBuilder,
    DefaultAgentDirector
}
export default Aries