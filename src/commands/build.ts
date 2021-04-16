import {Command, flags} from '@oclif/command'
import * as p from 'path'
import {getContext} from '../lib/context'
import {Combiner} from '../services/combine'
import {Stage, StagePatcher} from '../services/patch'
import {Merger} from '../services/merge'
import {writeOutputs} from '../lib/output'
import {findInvalidCharts, findInvalidPatchValues, loadChartDependencies} from '../lib/chart'


export default class Build extends Command {
  static examples = [
    `$ helm-values build
Build complete!`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({char: 's'}),
    all: flags.boolean({char: 'a', description: 'patch all if it is possible', default: false}),
    output: flags.string({char: 'o', description: ''}),
  }

  async run() {
    const {flags, argv} = this.parse(Build)
    const stage = (flags.stage || process.env.HELM_STAGE) as Stage

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

      const invalidPatch = findInvalidPatchValues(argv)
      if (invalidPatch.length > 0) {
        this.error(`invalid chart values: ${invalidPatch.join(', ')}`)
      }

      charts = argv
    }

    try {
      const context = getContext()
      const combiner = new Combiner(context)
      const combineResults = combiner.batch(charts.map((chart) => ({
        chart
      })))
      combineResults.forEach((cr) => {
        writeOutputs(cr)
      })

      const patcher = new StagePatcher(context, { stage })
      const patchResults = patcher.batch(charts.map((chart) => ({
        chart
      })))

      const merger = new Merger(context)
      const result = merger.action({ type: 'virtualFile', files: patchResults})
      writeOutputs([
        {
          path: p.join(context.helmRoot, 'values.yaml'),
          content: result.content,
        },
      ])
    } catch (error) {
      this.error(error)
    }
  }
}
