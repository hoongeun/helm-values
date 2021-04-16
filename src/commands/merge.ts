import {Command, flags} from '@oclif/command'
import * as p from 'path'
import {getContext} from '../lib/context'
import {Merger} from '../services/merge'
import {print, writeOutputs} from '../lib/output'
import {findInvalidCharts, findInvalidPatchValues, loadChartDependencies} from '../lib/chart'

export default class Merge extends Command {
  static examples = [
    `$ helm-values merge
Merge done!`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({char: 'a', description: 'merge all charts'}),
    print: flags.boolean({char: 'p', description: 'print the output in your console', default: false}),
  }

  static strict = false

  static args = [{name: 'chart'}]

  async run() {
    const {argv, flags} = this.parse(Merge)

    const context = getContext()
    const merger = new Merger(context)
    let charts: string[] = []

    if (flags.all) {
      if (argv.length > 0) {
        this.error(`you shouldn't set the charts ${argv.join(', ')}`)
      }
      charts = loadChartDependencies().map((dep) => dep.name)
      const invalidPatch = findInvalidPatchValues(charts)
      if (invalidPatch.length > 0) {
        this.error(`invalid chart values: ${invalidPatch.join(', ')}`)
      }
    } else {
      if (argv.length === 0) {
        this.error(`you should set the chart name
  ex) helm-values mysql redis`)
      }

      const invalid = findInvalidCharts(argv)
      if (invalid.length > 0) {
        this.error(`invalid chart: ${invalid.join(', ')}`)
      }

      charts = argv
    }

    try {
      const merger = new Merger(context)
      const result = merger.action({type: 'chart', charts})
      if (flags.print) {
        print([{
          path: '/values.yaml',
          content: result.content,
        }])
      } else {
        writeOutputs([
          {
            path: p.join(context.helmRoot, 'values.yaml'),
            content: result.content,
          },
        ])
      }
    } catch (error) {
      this.error(error)
    }
  }
}
