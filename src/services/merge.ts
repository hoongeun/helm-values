import * as yaml from 'js-yaml'
import * as p from 'path'
import { Operator } from './base'
import { File, Context } from '../types'
import { parseFile, parseData } from '../utils/data'

export type MergeTarget = {
  type: 'chart'
  charts: string[]
}|{
  type: 'virtualFile',
  files: File[]
};

export type MergeResult = File;

export type MergeOptions = {
  output: string;
}

export const DefaultOptions: MergeOptions = {
  output: `/values.yaml`,
}

export class Merger extends Operator<MergeTarget, MergeResult> {
  private options: MergeOptions;

  constructor(context: Context, options?: Partial<MergeOptions>) {
    super(context)
    this.options = Object.assign(DefaultOptions, options)
  }

  action(target: MergeTarget): MergeResult {
    let files: File[]
    if (target.type === 'chart') {
      files = target.charts.map((chart) => ({
        name: p.join(this.context.helmRoot, 'values', chart, 'values.yaml'),
        content: parseFile(p.join(this.context.helmRoot, 'values', chart, 'values.yaml')).toString()
      }))
    } else {
      files = target.files
    }
    return {
      name: p.resolve(this.context.helmRoot, this.options.output),
      content: yaml.dump(files.map(file => ({
        name: file.name,
        data: parseData(file.content, p.extname(file.name)),
      })).reduce((acc, {name, data}) => {
        acc[name] = data
        return acc
      }, {} as {[key: string]: object})),
    }
  }
}
