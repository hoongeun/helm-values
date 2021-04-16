import * as p from 'path'
import * as yaml from 'js-yaml'
import { assignIn } from 'lodash'
import { BatchOperator } from './base'
import { parseData, parseFile } from '../utils/data'
import { Context, File } from '../types'
import { doesFileExist } from '../utils/path'

export type Stage = string

type PatchOptions = {
  stage: Stage;
}

export type PatchTarget = {
  chart: string;
}

export type PatchResult = File

export class StagePatcher extends BatchOperator<PatchTarget, PatchResult> {
  private options: PatchOptions;

  constructor(conetxt: Context, options: PatchOptions) {
    super(conetxt)
    this.options = options
  }

  public action(target: PatchTarget): PatchResult {
    return patch(this.context.valuesDir, this.options.stage, target)
  }
}

function patch(dir: string, stage: Stage, target: PatchTarget): File {
  const patchedFile = p.join(dir, target.chart, `values.yaml`)
  const baseFile = p.join(dir, target.chart, `base.yaml`)
  const stageFile = p.join(dir, target.chart, `${stage}.yaml`)

  if (doesFileExist(baseFile)) {
    const basedata = parseFile(baseFile)
    if (doesFileExist(stageFile)) {
      const stagedata = parseFile(stageFile)
      return {
        name: patchedFile,
        content: yaml.dump(assignIn(basedata, stagedata)),
      }
    }

    return {
      name: patchedFile,
      content: yaml.dump(basedata),
    }
  }

  if (doesFileExist(stageFile)) {
    const stagedata = parseFile(stageFile)
    return {
      name: patchedFile,
      content: yaml.dump(stagedata),
    }
  }

  throw new Error('both base and stage file doesn\'t exist')
}
