import {Command, flags} from '@oclif/command'
import {Cleaner} from '../services/clean'
import {getContext} from '../lib/context'
import {findSubchartValuesDir} from '../lib/chart'

export default class Clean extends Command {
  static strict = false

  static examples = [
    `$ helm-values clean
Everything is clear now!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    'remove-subdirectory': flags.boolean({
      description: 'remove subdirectories in chart',
    }),
    stage: flags.string({
      char: 's',
      multiple: true,
      description: 'stages to clean',
    }),
  };

  static args = [{name: 'chart'}];

  async run() {
    const {flags, argv} = this.parse(Clean)

    let stages = flags.stage ?? []

    const flagLike = stages.findIndex(stage => {
      return stage.startsWith('-')
    })

    if (flagLike !== -1) {
      stages = flags.stage.slice(0, flagLike)
    }

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = findSubchartValuesDir()
    } else if (charts.length > 0) {
      const invalid = charts.filter(args =>
        charts.find(chart => chart === args) === undefined,
      )
      if (invalid.length > 0) {
        this.error(`invalid subchart: ${invalid.join(', ')}`)
      }
    }

    try {
      const context = getContext()
      const cleaner = new Cleaner(context, {
        removeSubdirectory: flags['remove-subdirectory'],
        stages,
      })
      await cleaner.batch(
        charts.map(chart => ({
          chart,
        })),
      )
      cleaner.cleanRootValues()

      this.log('Everything is clear now')
    } catch (error) {
      this.error(error)
    }
  }
}
