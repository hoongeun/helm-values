import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as p from 'path'
import {Operator} from './base'
import {File, Context} from '../types'
import {parseData} from '../utils/data'

export type MergeTarget =
  | {
      type: 'chart';
      charts: string[];
    }
  | {
      type: 'virtualFile';
      files: File[];
    };

export type MergeResult = File;

export type MergeOptions = {
  format: 'yaml'|'json';
  output: string;
};

export class Merger extends Operator<MergeTarget, MergeResult> {
  private options: MergeOptions;

  constructor(context: Context, options: Partial<MergeOptions>) {
    super(context)
    this.options = {
      format: options.format ?? 'yaml',
      output: options.output ?? p.join(this.context.helmRoot, `values.${options.format ?? 'yaml'}`),
    }
  }

  public async action(target: MergeTarget): Promise<MergeResult> {
    let files: File[]
    if (target.type === 'chart') {
      files = target.charts.map(chart => ({
        path: p.join(this.context.helmRoot, 'values', chart, 'values.yaml'),
        content: fs.readFileSync(
          p.join(this.context.helmRoot, 'values', chart, 'values.yaml'),
        ).toString(),
      }))
    } else {
      files = target.files
    }

    if (this.options.format === 'json') {
      return {
        path: p.resolve(this.context.helmRoot, this.options.output),
        content: JSON.stringify(
          this.mergeContent(files),
        ),
      }
    }

    return {
      path: this.options.output,
      content: yaml.dump(
        this.mergeContent(files),
      ),
    }
  }

  private mergeContent(files: File[]): { [chart: string]: object } {
    return files
    .map(file => ({
      name: p.basename(p.dirname(file.path)),
      data: parseData(file.content, p.extname(file.path)),
    }))
    .reduce((acc, {name, data}) => {
      acc[name] = data
      return acc
    }, {} as { [key: string]: object })
  }
}
