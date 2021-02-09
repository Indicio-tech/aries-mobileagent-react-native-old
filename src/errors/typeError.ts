import AgentError from './agentError'

export default class TypeError extends AgentError {
  constructor(expected: string, received: string, ...params: any[]) {
    super(1, 'TypeError', ...params)

    if (typeof expected !== 'string') {
      throw new Error('Error Constructor received invalid expected parameter')
    }
    if (typeof received !== 'string') {
      throw new Error('Error Constructor received invalid received parameter')
    }

    this.message = `Code ${this.code} - TypeError: Expected '${expected}' but got '${received}'`
  }
}

export class InvalidParameter extends AgentError {
  constructor(expected: string, received: string, ...params: any[]) {
    super(2, 'TypeError', ...params)

    if (typeof expected !== 'string') {
      throw new Error('Error Constructor received invalid expected parameter')
    }
    if (typeof received !== 'string') {
      throw new Error('Error Constructor received invalid received parameter')
    }

    this.message = `Code ${this.code} - TypeError: Expected value to be one of [${expected}] but got '${received}'`
  }
}
