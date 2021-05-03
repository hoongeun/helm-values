import {Command, flags} from '@oclif/command'
import {getContext} from '../lib/context'
import {Combiner} from '../services/combine'
import {StagePatcher} from '../services/patch'
import {Merger} from '../services/merge'
import {writeOutputs} from '../lib/output'
import {
  findUninstalledSubcharts,
  findInvalidPatchValues,
  loadChartDependencies,
} from '../lib/chart'

export default class Build extends Command {
  static strict = false

  static examples = [
    `$ helm-values build
Build complete!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({
      char: 's',
      description: 'specify the stage to build',
    }),
    output: flags.string({char: 'o', description: 'path to output'}),
    format: flags.enum({
      char: 'f',
      options: ['yaml', 'json'],
      description: 'preferred format of manifest',
      default: 'yaml',
    }),
  };

  async run() {
    const {flags, argv} = this.parse(Build)
    const stage = flags.stage ?? process.env.HELM_STAGE ?? ''

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = loadChartDependencies().map(dep => dep.name)
    } else {
      const invalid = findUninstalledSubcharts(charts)
      if (invalid.length > 0) {
        this.error(`invalid chart: ${invalid.join(', ')}`)
      }

      const invalidPatch = findInvalidPatchValues(charts, stage)
      if (invalidPatch.length > 0) {
        this.error(`invalid chart values: ${invalidPatch.join(', ')}`)
      }
    }

    const context = getContext()

    try {
      const combiner = new Combiner(context, {
        engine: 'auto',
        stages: [stage],
      })
      const combineResults = await combiner.batch(
        charts.map(chart => ({
          chart,
        })),
      )
      combineResults.forEach(cr => {
        writeOutputs(cr)
      })
    } catch (error) {
      this.error(error)
    }

    try {
      const patcher = new StagePatcher(context, {
        stage,
        format: 'yaml',
      })
      const patchResults = await patcher.batch(
        charts.map(chart => ({
          chart,
        })),
      )
      const merger = new Merger(context, {
        format: flags.format as 'json'|'yaml',
        output: flags.output,
      })
      const mergeResult = await merger.action({
        type: 'virtualFile',
        files: patchResults,
      })
      writeOutputs([
        {
          path: mergeResult.path,
          content: mergeResult.content,
        },
      ])

      this.log('Build complete!')
    } catch (error) {
      this.error(error)
    }
  }
}
