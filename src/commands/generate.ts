import {Command, flags} from '@oclif/command'
import {Generator, GenerateFormat, TemplateFormat} from '../services/generate'
import {getContext} from '../lib/context'
import {findInvalidCharts, loadChartDependencies} from '../lib/chart'

export default class Generate extends Command {
  static examples = [
    `$ helm-values generate -s prod dev test -- mysql redis
Generate mysql, redis successfully!`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({char: 's', multiple: true}),
    "no-base": flags.boolean({default: false}),
    format: flags.enum({char: 'f', options: ['yaml', 'json'], description: 'preferred format of manifest', default: 'yaml'}),
    template: flags.enum({char: 't', options: ['njk', 'ejs'], description: 'preferred format of manifest'}),
    all: flags.boolean({default: false})
  }

  static strict = false;

  static args = [{name: 'chart'}]

  async run() {
    const {argv, flags} = this.parse(Generate)

    const context = getContext()
    const generator = new Generator(context, {
      base: !flags['no-base'],
      stages: flags.stage,
      format: flags.format as GenerateFormat,
      template: flags.template as TemplateFormat
    })

    let charts: string[] = []

    console.log(flags.stage)

    if (flags.all) {
      if (argv.length > 0) {
        this.error(`you shouldn't set the charts`)
      }
      charts = loadChartDependencies().map((dep) => dep.name)
    } else {
      if (argv.length === 0) {
        this.error(`you have to set the chart name
  ex) helm-values generate mysql redis`)
      }

      const invalid = findInvalidCharts(argv)
      if (invalid.length > 0) {
        this.error(`invalid chart: ${invalid.join(', ')}`)
      }

      charts = argv
    }

    generator.batch(charts.map(chart => ({
      chart,
    })))

    this.log(`Generate ${charts.join(', ')} successfully`)
  }
}
