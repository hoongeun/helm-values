import * as fs from 'fs'
import * as p from 'path'
import outdent from 'outdent'
import * as yaml from 'js-yaml'
import {BaseOperator} from './base'
import {doesFileExist} from '../utils/path'


export type InitTarget = void

export type InitResult = void

export class Initiator extends BaseOperator<InitTarget, InitResult> {
  action(): InitResult {
    const helmRoot = this.context.helmRoot
    if (!helmRoot) {
      return
    }

    const valuesDir = p.join(helmRoot, 'values')
    const helmValuesConfig = p.join(valuesDir, '.helmvalues')
    const globalDataFile = p.join(valuesDir, 'global.yaml')

    if (doesFileExist(helmValuesConfig)) {
      throw new Error('helm-values is already initiated. please remove the the values directory, and try again.')
    }

    fs.mkdirSync(valuesDir)
    fs.writeFileSync(helmValuesConfig, yaml.dump({
      stages: ['dev', 'prod', 'test'],
      format: 'yaml',
      combine: {
        template: 'auto'
      }
    }).toString())
    fs.writeFileSync(globalDataFile, outdent`
      # This is global data file.
      # This data will be used in assign operation

      `)
  }
}
