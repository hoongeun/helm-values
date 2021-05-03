import {Command, flags} from '@oclif/command'
import {getContext} from '../lib/context'
import {Merger} from '../services/merge'
import {print, writeOutputs} from '../lib/output'
import {
  findInvalidMergeValues,
  findSubchartValuesDir,
} from '../lib/chart'

export default class Merge extends Command {
  static strict = false

  static examples = [
    `$ helm-values merge
Merge done!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    format: flags.enum({
      char: 'f',
      options: ['yaml', 'json'],
      description: 'preferred format of manifest',
      default: 'yaml',
    }),
    print: flags.boolean({
      char: 'p',
      description: 'print the output in your console',
      default: false,
    }),
  };

  static args = [{name: 'chart'}];

  async run() {
    const {argv, flags} = this.parse(Merge)

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = findSubchartValuesDir()
    } else {
      const invalid = findInvalidMergeValues(charts)

      if (invalid.length > 0) {
        this.error(`invalid chart: ${invalid.join(', ')}`)
      }
    }

    if (charts.length === 0) {
      this.error('no values to merge')
    }

    try {
      const context = getContext()
      const merger = new Merger(context, {
        format: flags.format as 'json'|'yaml',
      })

      const result = await merger.action({type: 'chart', charts})
      if (flags.print) {
        print([
          {
            path: result.path,
            content: result.content,
          },
        ])
      } else {
        writeOutputs([
          {
            path: result.path,
            content: result.content,
          },
        ])
      }

      this.log('Merge done!')
    } catch (error) {
      this.error(error)
    }
  }
}
