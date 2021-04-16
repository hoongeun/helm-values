import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as p from 'path'
import {Cleaner} from '../services/clean'
import {getContext} from '../lib/context'
import {findSubchartValuesDir} from '../lib/chart'
import {doesFileExist} from '../utils/path'

export default class Clean extends Command {
  static examples = [
    `$ helm-values clean
Clean successfully!`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({char: 'a', description: 'clean all if it is possible', default: false}),
  }

  static args = []

  async run() {
    const {flags, argv} = this.parse(Clean)

    let charts: string[] = []

    if (flags.all) {
      if (argv.length > 0) {
        this.error(`you shouldn't set the charts ${argv.join(', ')}`)
      }
      charts = findSubchartValuesDir()
    } else {
      if (argv.length === 0) {
        this.error(`you should set the chart name
  ex) helm-values mysql redis`)
      }

      charts = argv
    }

    try {
      const context = getContext()
      const cleaner = new Cleaner(context)
      cleaner.batch(charts.map((chart) => ({
        chart
      })))
      const valuesYaml = p.join(context.helmRoot, 'values.yaml')
      if (doesFileExist(valuesYaml)) {
        fs.unlinkSync(valuesYaml)
      }
    } catch (e) {
      this.error(e)
    }
  }
}
