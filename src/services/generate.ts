import * as fs from 'fs'
import * as p from 'path'
import {BatchOperator} from './base'
import {Context} from '../types'
import {doesDirectoryExist, doesFileExist} from '../utils/path'
import {stripIndent} from 'common-tags'

export type GenerateFormat = 'yaml' | 'json';
export type TemplateFormat = 'njk' | 'ejs';

export type GenerateOptions = {
  base: boolean;
  stages: string[];
  format: GenerateFormat;
  template?: TemplateFormat;
};

export type GenerateTarget = {
  chart: string;
};

export type GenerateResult = void;

export class Generator extends BatchOperator<GenerateTarget, GenerateResult> {
  private options: GenerateOptions;

  constructor(context: Context, options: GenerateOptions) {
    super(context)
    this.options = options
  }

  public async action(target: GenerateTarget): Promise<GenerateResult> {
    const format: GenerateFormat = this.options.format ?? 'yaml'
    const chartDir = p.join(this.context.valuesDir, target.chart)

    if (!doesDirectoryExist(chartDir)) {
      fs.mkdirSync(chartDir)
    }

    if (this.options.base) {
      if (this.options.template) {
        this.generateTemplate(
          target.chart,
          'base',
          format,
          this.options.template,
        )
        this.generateData(
          target.chart,
          'base',
          format,
        )
      } else {
        this.generateValue(target.chart, 'base', format)
      }
    }

    this.options.stages.forEach(stage => {
      if (this.options.template) {
        this.generateTemplate(
          target.chart,
          stage,
          format,
          this.options.template,
        )
        this.generateData(
          target.chart,
          stage,
          format,
        )
      } else {
        this.generateValue(target.chart, stage, format)
      }
    })
  }

  private generateValue(
    chart: string,
    stage: string,
    format: GenerateFormat,
  ): void {
    const name = `${stage}.${format}`
    const path = p.join(this.context.helmRoot, 'values', chart, name)

    if (doesFileExist(path)) {
      console.warn(`${p.join(chart, name)} is already exists`)
      return
    }

    switch (format) {
    case 'json':
      fs.writeFileSync(path, '{\n}')
      break
    case 'yaml':
      fs.writeFileSync(
        path,
        stripIndent`
      # This is ${chart} chart ${stage} values
      `,
      )
      break
    default:
      throw new Error('unsupported format')
    }
  }

  private generateTemplate(
    chart: string,
    stage: string,
    format: GenerateFormat,
    template: TemplateFormat,
  ): void {
    const name = `${stage}.${format}.${template}`
    const path = p.join(this.context.helmRoot, 'values', chart, name)

    if (doesFileExist(path)) {
      console.warn(`${p.join(chart, name)} is already exists`)
      return
    }

    switch (format) {
    case 'json':
      fs.writeFileSync(path, '{\n}')
      break
    case 'yaml':
      fs.writeFileSync(
        path,
        stripIndent`
      # This is ${chart} chart ${stage} template
      `,
      )
      break
    default:
      throw new Error('unsupported template')
    }
  }

  private generateData(
    chart: string,
    stage: string,
    format: GenerateFormat,
  ): void {
    const name = `${stage}.data.${format}`
    const path = p.join(this.context.helmRoot, 'values', chart, name)

    if (doesFileExist(path)) {
      console.warn(`${p.join(chart, name)} is already exists`)
      return
    }

    switch (format) {
    case 'json':
      fs.writeFileSync(path, '{\n}')
      break
    case 'yaml':
      fs.writeFileSync(
        path,
        stripIndent`
      # This is ${chart} chart ${stage} data
      `,
      )
      break
    default:
      throw new Error('unsupported data format')
    }
  }
}
