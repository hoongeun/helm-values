import {Command} from '@oclif/command'
import {Initiator} from '../services/init'
import {getBaseContext} from '../lib/context'

export default class Init extends Command {
  static examples = [
    `$ helm-values init
Initiate helm-values!`,
  ];

  async run() {
    try {
      const context = getBaseContext()
      const initiator = new Initiator(context)
      initiator.action()

      this.log('Initiate helm-values!')
    } catch (error) {
      this.error(error)
    }
  }
}
