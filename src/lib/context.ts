import * as fs from 'fs'
import * as p from 'path'
import * as yaml from 'js-yaml'
import {findHelmRoot} from './chart'
import {BaseContext, Context, Config} from '../types'

export function getBaseContext(): BaseContext {
  const helmRoot = findHelmRoot()

  return {
    helmRoot,
    valuesDir: p.join(helmRoot, 'values'),
    cwd: process.cwd(),
  }
}

export function getContext(): Context {
  const baseContext = getBaseContext()
  const configFile = fs.readFileSync(
    p.join(baseContext.helmRoot, 'values', '.helmvalues'),
  )
  const config = yaml.load(configFile.toString()) as Config

  return {
    ...baseContext,
    config,
  }
}
