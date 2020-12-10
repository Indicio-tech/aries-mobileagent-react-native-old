//For UUIDv4 within React Native
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import url from 'url'
import axios from 'axios'

global.Buffer = global.Buffer || require('buffer').Buffer


import {AgentBuilder, AgentLoader, AgentDirector} from './agent'

const Aries = {
    AgentBuilder: AgentBuilder,
    AgentLoader: AgentLoader,
    AgentDirector: AgentDirector,
}
export default Aries