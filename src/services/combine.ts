import * as nunjucks from 'nunjucks'
import * as ejs from 'ejs'
import * as p from 'path'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import {assignIn} from 'lodash'
import {BatchOperator} from './base'
import {Output} from '../lib/output'
import {parseFile} from '../utils/data'
import {Context, Engine, File} from '../types'
import {doesFileExist} from '../utils/path'

export type CombineTarget = {
  chart: string
}

export type CombineResult = Output[]

export type CombineOptions = {
  engine: 'auto'|Engine;
}

export const DefaultCombineOptions: CombineOptions = {
  engine: 'auto',
}


export class Combiner extends BatchOperator<CombineTarget, CombineResult> {
  private options: CombineOptions;

  constructor(context: Context, options?: Partial<CombineOptions>) {
    super(context)
    this.options = Object.assign(DefaultCombineOptions, options)
  }

  public action(target: CombineTarget): CombineResult {
    let globaldata = {}
    if (doesFileExist(p.join(this.context.valuesDir, 'global.yaml'))) {
      globaldata = parseFile(p.join(this.context.valuesDir, 'global.yaml'))
    } else if (doesFileExist(p.join(this.context.valuesDir, 'global.json'))) {
      globaldata = parseFile(p.join(this.context.valuesDir, 'global.json'))
    }

    let localdata = {}
    if (doesFileExist(p.join(this.context.valuesDir, target.chart, 'global.yaml'))) {
      localdata = parseFile(p.join(this.context.valuesDir, target.chart, 'global.yaml'))
    } else if (doesFileExist(p.join(this.context.valuesDir, target.chart, 'global.json'))) {
      localdata = parseFile(p.join(this.context.valuesDir, target.chart, 'global.json'))
    }

    const data = assignIn(globaldata, localdata)
    const templates = fs.readdirSync(p.join(this.context.valuesDir, target.chart), { withFileTypes: true })
      .filter((dirent) => dirent.isFile() && /^\w+\.\w+\.(njk|ejs))$/.test(dirent.name))
    return templates.map((template) => this.combineAction(data, p.join(this.context.valuesDir, target.chart, template.name)))
  }

  private combineAction(data: object, template: string): Output {
    switch (this.options.engine) {
      case 'nunjucks':
        return {
          path: this.rename(template),
          content: Combiner.nunjucksAction(template, data),
        }
      case 'ejs':
        return {
          path: this.rename(template),
          content: Combiner.ejsAction(template, data),
        }
      case 'auto':
      default:
        return {
          path: this.rename(template),
          content: yaml.dump(Combiner.autoCombineAction(template, data)),
        }
      }
  }

  private static autoCombineAction(path: string, data: object): string {
    switch (p.extname(path)) {
    case '.ejs':
      return Combiner.ejsAction(path, data)
    case '.njk':
      return Combiner.nunjucksAction(path, data)
    default:
      throw new Error('unsupported data format')
    }
  }

  private static nunjucksAction(path: string, data: object): string {
    nunjucks.configure({autoescape: false})
    return nunjucks.render(path, data)
  }

  private static ejsAction(path: string, data: object): string {
    const content = fs.readFileSync(path)
    return ejs.render(content.toString(), data, {escape: (markup: any) => markup.toString()})
  }

  /**
   * rename template to value file
   * 'name.dev.njk' -> 'name.dev.yaml'
   * @param path
   * @private
   * @return renamed
   */
  private rename(path: string): string {
    return `${p.basename(path, p.extname(path))}.yaml`
  }
}

function getGlobalData(valuesDir: string): object {
  if (doesFileExist(p.join(valuesDir, 'global.yaml'))) {
    return parseFile(p.join(valuesDir, 'global.yaml'))
  }

  if (doesFileExist(p.join(valuesDir, 'global.json'))) {
    return parseFile(p.join(valuesDir, 'global.json'))
  }

  return {}
}

