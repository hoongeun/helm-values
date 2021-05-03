import {Command, flags} from '@oclif/command'
import {getContext} from '../lib/context'
import {StagePatcher} from '../services/patch'
import {print, writeOutputs} from '../lib/output'
import {findSubchartValuesDir, findInvalidPatchValues} from '../lib/chart'

export default class Patch extends Command {
  static strict = false

  static examples = [
    `$ helm-values patch -s dev -- mysql
Patch done!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({
      char: 's',
      description: 'stage to patch',
      required: true,
    }),
    print: flags.boolean({
      char: 'p',
      description: 'print the output in your console',
      default: false,
    }),
    format: flags.enum({
      char: 'f',
      options: ['yaml', 'json'],
      description: 'preferred format of manifest',
      default: 'yaml',
    }),
  };

  static args = [{name: 'chart'}];

  async run() {
    const {flags, argv} = this.parse(Patch)
    const context = getContext()
    const stage = flags.stage ?? process.env.HELM_STAGE ?? ''

    if (!stage) {
      this.error(
        "you have to specify the stage by setting --stage(-s) or setting variable 'HELM_STAGE'",
      )
    }

    const patcher = new StagePatcher(context, {
      stage,
      format: flags.format as 'yaml'|'json',
    })

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = findSubchartValuesDir()
    } else {
      const invalidPatch = findInvalidPatchValues(charts, stage)
      if (invalidPatch.length > 0) {
        this.error(`invalid chart values: ${invalidPatch.join(', ')}`)
      }
    }

    if (charts.length === 0) {
      this.error('no charts to patch')
    }

    try {
      const results = await patcher.batch(charts.map(chart => ({chart})))
      if (flags.print) {
        print(results.map(file => ({
          path: file.path,
          content: file.content,
        })))
      } else {
        writeOutputs(results.map(file => ({
          path: file.path,
          content: file.content,
        })))
      }

      this.log('Patch done!')
    } catch (error) {
      this.error(error)
    }
  }
}
