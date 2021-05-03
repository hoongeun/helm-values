import * as nunjucks from 'nunjucks'
import * as ejs from 'ejs'
import * as p from 'path'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import {assignIn, cloneDeep} from 'lodash'
import {BatchOperator} from './base'
import {Output} from '../lib/output'
import {groupByStage} from '../lib/chart'
import {parseFile, parseDatafile} from '../utils/data'
import {Context, Engine} from '../types'

export type CombineTarget = {
  chart: string;
};

export type CombineResult = Output[];

export type CombineOptions = {
  engine: 'auto' | Engine;
  stages: string[];
};

export class Combiner extends BatchOperator<CombineTarget, CombineResult> {
  private options: CombineOptions;

  private globaldata: object;

  constructor(context: Context, options: CombineOptions) {
    super(context)
    this.options = options
    this.globaldata = parseDatafile(this.context.valuesDir, 'data')
  }

  public async action(target: CombineTarget): Promise<CombineResult> {
    const groups = groupByStage(target.chart)

    const chartdata: object = parseDatafile(p.join(this.context.valuesDir, target.chart), 'data')

    let stages = this.options.stages

    if (stages.length === 0) {
      stages = Object.keys(groups.stages)
    }

    const combines = await stages.reduce(async (accp, stage) => {
      const acc = await accp

      if (!groups.stages[stage]) {
        return Promise.resolve(acc)
      }

      const needConfirm: { type: string; choices: string[] }[] = []
      let template: string|undefined
      let stagedata: object = {}

      if (groups.stages[stage].template.length > 1) {
        needConfirm.push({
          type: 'template',
          choices: groups.stages[stage].template,
        })
      } else if (groups.stages[stage].template.length === 1) {
        template = groups.stages[stage].template[0]
      }

      if (groups.stages[stage].data.length > 1) {
        needConfirm.push({
          type: 'data',
          choices: groups.stages[stage].data,
        })
      } else if (groups.stages[stage].data.length === 1) {
        stagedata = parseFile(
          p.join(
            this.context.valuesDir,
            target.chart,
            groups.stages[stage].data[0],
          ),
        )
      }

      if (needConfirm.length > 0) {
        const answers = await inquirer.prompt(
          needConfirm.map(confirm => ({
            type: 'list',
            name: `${stage} - ${confirm.type}`,
            message: 'Which one do you want to use?',
            choices: confirm.choices,
          })),
        )

        answers.forEach((answer: string, i: number) => {
          if (needConfirm[i].type === 'data') {
            stagedata = parseFile(
              p.join(this.context.valuesDir, target.chart, answer),
            )
          } else {
            template = answer
          }
        })
      }

      if (template) {
        acc.push({
          template,
          data: assignIn(cloneDeep(this.globaldata), cloneDeep(chartdata), cloneDeep(stagedata)),
        })
      }

      return Promise.resolve(acc)
    }, Promise.resolve([] as { template: string; data: object }[]))
    return combines.map(combine =>
      this.combineAction(
        p.join(this.context.valuesDir, target.chart, combine.template),
        combine.data,
      ),
    )
  }

  private combineAction(template: string, data: object): Output {
    switch (this.options.engine) {
    case 'nunjucks':
      return {
        path: Combiner.rename(template),
        content: Combiner.nunjucksAction(template, data),
      }
    case 'ejs':
      return {
        path: Combiner.rename(template),
        content: Combiner.ejsAction(template, data),
      }
    case 'auto':
    default:
      return {
        path: Combiner.rename(template),
        content: Combiner.autoCombineAction(template, data),
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
      throw new Error('unsupported template')
    }
  }

  private static nunjucksAction(path: string, data: object): string {
    nunjucks.configure({autoescape: false})
    return nunjucks.render(path, data)
  }

  private static ejsAction(path: string, data: object): string {
    const content = fs.readFileSync(path)
    return ejs.render(content.toString(), data, {
      escape: (markup: any) => markup === undefined ?
        '' : markup.toString(),
    })
  }

  private static rename(path: string): string {
    return p.join(p.dirname(path), p.basename(path, p.extname(path)))
  }
}
