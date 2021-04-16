import * as fs from 'fs'
import * as p from 'path'
import {BatchOperator} from './base'
import {Context} from '../types'
import {doesDirectoryExist, doesFileExist} from '../utils/path'
import { template } from '@oclif/plugin-help/lib/util'

export type GenerateFormat = 'yaml'|'json'
export type TemplateFormat = 'njk'|'ejs'

export type GenerateOptions = {
  base: boolean
  stages: string[]
  format: GenerateFormat
  template?: TemplateFormat
}

export type GenerateTarget = {
  chart: string;
}

export type GenerateResult = void

export class Generator extends BatchOperator<GenerateTarget, GenerateResult> {
  private options: GenerateOptions;

  constructor(context: Context, options: GenerateOptions) {
    super(context)
    this.options = options
  }

  public action(target: GenerateTarget): GenerateResult {
    const format: GenerateFormat = this.options.format ?? 'yaml'

    if (this.options.base) {
      const chartDir = p.join(this.context.valuesDir, target.chart)
      if (!doesDirectoryExist(chartDir)) {
        fs.mkdirSync(chartDir)
      }
      this.generateValue(target.chart, 'base', format, this.options.template)
    }

    const stages = this.options.stages?.length > 0 ? this.options.stages : this.context.config.stages

    stages.forEach((stage) => {
      this.generateValue(target.chart, stage, format, this.options.template)
    })
  }

  private generateValue(chart: string, stage: string, format: GenerateFormat, template?: TemplateFormat): void {
    const name = `${stage}.${format}.${template ?? ''}`
    const path = p.join(this.context.helmRoot, 'values', chart, name)

    if (doesFileExist(path)) {
      console.warn(`${p.join(chart, name)} is already exists`)
      return
    }

    switch (format) {
    case 'json':
      fs.writeFileSync(path, '')
      break
    case 'yaml':
      fs.writeFileSync(path, '{\n}')
      break
    default:
      throw new Error('unsupported')
    }
  }
}

