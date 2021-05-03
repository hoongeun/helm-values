import * as p from 'path'
import * as yaml from 'js-yaml'
import {assignIn} from 'lodash'
import {BatchOperator} from './base'
import {parseFile} from '../utils/data'
import {Context, File} from '../types'
import {doesFileExist} from '../utils/path'
import {groupByStage} from '../lib/chart'

type PatchOptions = {
  stage: string;
  format: 'yaml'|'json';
};

export type PatchTarget = {
  chart: string;
};

export type PatchResult = File;

export class StagePatcher extends BatchOperator<PatchTarget, PatchResult> {
  private options: PatchOptions;

  constructor(conetxt: Context, options: PatchOptions) {
    super(conetxt)
    this.options = options
  }

  public async action(target: PatchTarget): Promise<PatchResult> {
    const groups = groupByStage(target.chart)

    if (groups.stages.base?.values.length >= 2) {
      throw new Error(`conflict ${target.chart} base values: ${groups.stages.base.values.join(', ')}`)
    }

    if (groups.stages[this.options.stage]?.values.length >= 2) {
      throw new Error(`conflict ${target.chart} ${this.options.stage} values: ${groups.stages[this.options.stage].values.join(', ')}`)
    }

    return patch(this.context.valuesDir, this.options.stage, target, this.options.format)
  }
}

function patch(
  dir: string,
  stage: string,
  target: PatchTarget,
  format: 'yaml'|'json',
): PatchResult {
  let baseValues: object|undefined
  let stageValues: object|undefined

  if (doesFileExist(p.join(dir, target.chart, 'base.yaml'))) {
    baseValues = parseFile(p.join(dir, target.chart, 'base.yaml'))
  } else if (doesFileExist(p.join(dir, target.chart, 'base.json'))) {
    baseValues = parseFile(p.join(dir, target.chart, 'base.json'))
  }

  if (doesFileExist(p.join(dir, target.chart, `${stage}.yaml`))) {
    stageValues = parseFile(p.join(dir, target.chart, `${stage}.yaml`))
  } else if (doesFileExist(p.join(dir, target.chart, `${stage}.json`))) {
    stageValues = parseFile(p.join(dir, target.chart, `${stage}.json`))
  }

  if (baseValues === undefined && stageValues === undefined) {
    throw new Error("both base and stage file don't exist")
  }

  if (format === 'json') {
    return {
      path: p.join(dir, target.chart, 'values.json'),
      content: JSON.stringify(assignIn(baseValues, stageValues), null, 2),
    }
  }

  return {
    path: p.join(dir, target.chart, 'values.yaml'),
    content: yaml.dump(assignIn(baseValues, stageValues)),
  }
}
