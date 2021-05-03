import {Command, flags} from '@oclif/command'
import {
  Generator,
  GenerateFormat,
  TemplateFormat,
} from '../services/generate'
import {getContext} from '../lib/context'
import {loadChartDependencies} from '../lib/chart'

export default class Generate extends Command {
  static strict = false

  static examples = [
    `$ helm-values generate
Generate mysql, redis successfully!`,
    `$ helm-values generate -- mysql redis
Generate mysql, redis successfully!`,
    `$ helm-values generate -s prod dev test -- mysql redis
Generate mysql, redis successfully!`,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({
      char: 's',
      multiple: true,
      description:
        "stages to generate (If you do not specify the stages, then it will refer the stages values in '/values/.helmvalues')",
      default: [],
    }),
    'base-only': flags.boolean({
      default: false,
      description: "don't generate base.yaml or base.json",
    }),
    'no-base': flags.boolean({
      default: false,
      description: 'generate only base',
    }),
    format: flags.enum({
      char: 'f',
      options: ['yaml', 'json'],
      description: 'preferred format of manifest',
      default: 'yaml',
    }),
    template: flags.enum({
      char: 't',
      options: ['njk', 'ejs'],
      description: 'preferred template of manifest',
    }),
    data: flags.boolean({char: 'd', default: false, description: ''}),
  };

  static args = [{name: 'chart'}];

  async run() {
    const context = getContext()

    const {argv, flags} = this.parse(Generate)

    let stages: string[] = flags.stage

    if (flags.stage.length > 0) {
      const flagLike = flags.stage.findIndex(stage => {
        return stage.startsWith('-')
      })

      if (flagLike !== -1) {
        stages = flags.stage.slice(0, flagLike)
      }
    } else {
      stages = flags.stage.length > 0 ? flags.stage : (context.config.stages || [])
    }

    if (flags.stage.length > 0 && stages.find(s => s === 'data')) {
      this.error("you can't use 'data' as stage name")
    }

    if (flags.stage.length > 0 && flags['base-only']) {
      this.error(
        "The option '--stage' and '--base-only' can't be used in single command",
      )
    }

    if (flags['no-base'] && flags['base-only']) {
      this.error(
        "The option '--no-base' and '--base-only' can't be used in single command",
      )
    }

    let charts: string[] = argv

    if (charts.length === 0) {
      charts = loadChartDependencies().map(dep => dep.name)

      if (charts.length === 0) {
        this.error('no charts to generate')
      }
    }

    const generator = new Generator(context, {
      base: !flags['no-base'],
      stages,
      format: flags.format as GenerateFormat,
      template: flags.template as TemplateFormat,
    })

    try {
      await generator.batch(
        charts.map(chart => ({
          chart,
        })),
      )
      this.log(`Generate ${charts.join(', ')} successfully!`)
    } catch (error) {
      this.error(error)
    }
  }
}
