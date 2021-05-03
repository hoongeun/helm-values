import {Command, flags} from '@oclif/command'
import {getContext} from '../lib/context'
import {Combiner} from '../services/combine'
import {writeOutputs} from '../lib/output'
import {findSubchartValuesDir, findInvalidCombineValues} from '../lib/chart'

export default class Combine extends Command {
  static strict = false

  static examples = [
    `$ helm-values combine -s dev -- mysql
Combine done!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({
      char: 's',
      multiple: true,
      description: 'stage to Combine',
      default: [],
    }),
  };

  static args = [{name: 'chart'}];

  async run() {
    const {flags, argv} = this.parse(Combine)

    let stages = flags.stage

    const flagLike = flags.stage.findIndex(stage => {
      return stage.startsWith('-')
    })

    if (flagLike !== -1) {
      stages = flags.stage.slice(0, flagLike)
    }

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = findSubchartValuesDir()
    } else {
      const invalids = findInvalidCombineValues(charts, stages)

      if (invalids.length > 0) {
        this.error(`invalid chart values: ${invalids.join(', ')}`)
      }
    }

    if (charts.length === 0) {
      this.error('no charts to combine')
    }

    const context = getContext()
    const combiner = new Combiner(context, {
      stages,
      engine: 'auto',
    })

    try {
      const results = await combiner.batch(charts.map(chart => ({chart})))

      results.forEach(outputs => {
        writeOutputs(outputs)
      })

      this.log('Combine done!')
    } catch (error) {
      this.error(error)
    }
  }
}
