import * as p from 'path'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as shelljs from 'shelljs'
import {BatchOperator} from './base'
import {groupByStage} from '../lib/chart'
import {doesDirectoryExist, doesFileExist} from '../utils/path'
import {Context} from '../types'

export type CleanTarget = {
  chart: string;
};

export type CleanResult = void;

export type CombineOptions = {
  stages: string[];
  removeSubdirectory: boolean;
};

export class Cleaner extends BatchOperator<CleanTarget, CleanResult> {
  private options: CombineOptions;

  constructor(context: Context, options: CombineOptions) {
    super(context)
    this.options = options
  }

  public async action(target: CleanTarget): Promise<CleanResult> {
    if (doesDirectoryExist(p.join(this.context.valuesDir, target.chart))) {
      await this.cleanUp(target.chart)
      if (this.options.removeSubdirectory) {
        this.removeSubdirectory(target.chart)
      }
    }
  }

  private async cleanUp(chart: string): Promise<void> {
    const groups = groupByStage(chart)
    const toRemove: string[] = ['values.yaml', 'values.json']
    const needConfirm: {
      stage: string;
      type: 'template' | 'data' | 'values';
      choices: string[];
    }[] = []

    Object.entries(groups.stages).forEach(([stage, stageGroup]) => {
      if (
        this.options.stages.length > 0 &&
        this.options.stages.find(s => s === stage) !== undefined
      ) {
        return
      }

      if (stageGroup.template.length > 0) {
        toRemove.push(...stageGroup.values)
        if (stageGroup.template.length > 1) {
          needConfirm.push({
            stage,
            type: 'template',
            choices: stageGroup.template,
          })
        }
      }

      // remove data files who has no templates
      if (stageGroup.template.length === 0 && stageGroup.data.length > 0) {
        toRemove.push(...stageGroup.data)
      } else if (stageGroup.data.length > 1) {
        needConfirm.push({
          stage,
          type: 'data',
          choices: stageGroup.data,
        })
      }

      if (stageGroup.values.length > 1) {
        needConfirm.push({
          stage,
          type: 'values',
          choices: stageGroup.values,
        })
      }
    })

    const answers = await inquirer.prompt(
      needConfirm.map(confirm => ({
        type: 'list',
        name: `${confirm.stage} - ${confirm.type}`,
        message: 'Which one do you want to remain?',
        choices: confirm.choices,
      })),
    )

    needConfirm.forEach((toConfirm, i) => {
      toRemove.push(
        ...toConfirm.choices.filter(choice => choice !== answers[i]),
      )
    })
    toRemove.forEach(remove => {
      if (doesFileExist(p.join(this.context.valuesDir, chart, remove))) {
        fs.unlinkSync(p.join(this.context.valuesDir, chart, remove))
      }
    })
  }

  private removeSubdirectory(chart: string) {
    fs.readdirSync(p.join(this.context.valuesDir, chart), {
      withFileTypes: true,
    })
    .filter(dirent => dirent.isDirectory())
    .forEach(dirent => {
      shelljs.rm('-rf', p.join(this.context.valuesDir, chart, dirent.name))
    })
  }

  public cleanRootValues(): void {
    if (doesFileExist(p.join(this.context.helmRoot, 'values.yaml'))) {
      fs.unlinkSync(p.join(this.context.helmRoot, 'values.yaml'))
    }
  }
}
