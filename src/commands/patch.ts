import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as p from 'path'
import {getContext} from '../lib/context'
import {Stage, StagePatcher, PatchTarget} from '../services/patch'
import {file2Output, print, writeOutputs} from '../lib/output'

export default class Patch extends Command {
  static examples = [
    `$ helm-values patch -s dev mysql
Patch done!`,
    `$ helm-values patch -a
Patch done!`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    stage: flags.string({char: 's', description: 'stage to patch', required: true}),
    all: flags.boolean({description: 'patch all if it is possible', default: false}),
    print: flags.boolean({char: 'p', description: 'print the output in your console', default: false}),
  }

  static strict = false

  static args = [{name: 'chart'}]

  async run() {
    const {flags, argv} = this.parse(Patch)
    const context = getContext()
    const stage = (flags.stage || process.env.HELM_STAGE) as Stage

    if (stage.length > 0) {
      const patcher = new StagePatcher(context, {
        stage,
      })

      if (flags.all) {
        if (argv.length > 0) {
          this.error(`you shouldn't set the charts ${argv.join(', ')}`)
          return
        }
      } else if (argv.length === 0) {
        this.error(`you should set the name of chart
ex) helm-values patch -s dev mysql redis`)
        return
      }

      const chartdirs = fs.readdirSync(context.valuesDir, {withFileTypes: true})
        .filter((dirent) => dirent.isDirectory())
      const nonexists = argv.filter(argc => !chartdirs.find(d => d.name === argc))

      if (!flags.all && nonexists.length > 0) {
        this.error(`there are invalid chart names - ${nonexists.join(', ')}`)
      }

      const chartFiles = chartdirs.reduce((acc, chartdir) => {
        const re = new RegExp(/^\w+\.(yaml|json)$/)
        const envs = fs.readdirSync(p.join(context.valuesDir, chartdir.name), {withFileTypes: true})
          .filter((dirent) => dirent.isFile() && re.test(dirent.name))
        envs.forEach((dirent) => {
          const format = p.extname(dirent.name)
          const stage = p.extname(p.basename(dirent.name, format))
          const chart = p.basename(p.basename(dirent.name, format), stage)
          if (format && stage && chart && [flags.stage, 'base'].includes(stage)) {
            const idx2 = acc.findIndex(target => target.chart === chart)
            if (idx2 === -1) {
              acc.push({
                chart,
                [stage]: {
                  path: p.join(context.valuesDir, chartdir.name, dirent.name),
                  content: fs.readFileSync(p.join(context.valuesDir, chartdir.name, dirent.name)),
                },
              })
            } else {
              acc[idx2] = {
                ...acc[idx2],
                [stage]: {
                  path: p.join(context.valuesDir, chartdir.name, dirent.name),
                  content: fs.readFileSync(p.join(context.valuesDir, chartdir.name, dirent.name)),
                },
              }
            }
          }
        })
        return acc
      }, [] as PatchTarget[])

      try {
        const results = patcher.batch(chartFiles)
        if (flags.print) {
          print(results.map(file2Output))
        } else {
          writeOutputs(results.map(file2Output))
        }
      } catch (error) {
        this.error(error)
      }
    } else {
      this.error('you have to specify the stage by setting --stage(-s) or setting variable \'HELM_STAGE\'')
    }
  }
}
