import {Command} from '@oclif/command'
import {Initiator} from '../services/init'
import {getBaseContext} from '../lib/context'

export default class Init extends Command {
  static examples = [
    `$ helm-values init
Initiate successfully!`,
  ]

  async run() {
    const context = getBaseContext()
    const initiator = new Initiator(context)
    initiator.action()
    this.log("Initiate successfully!")
  }
}
