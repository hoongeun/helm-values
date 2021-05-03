import * as fs from 'fs'
import * as p from 'path'
import {assignIn} from 'lodash'
import * as yaml from 'js-yaml'
import {doesFileExist} from './path'

export function parseData(content: string, ext: string): object {
  switch (ext) {
  case '.json':
    return JSON.parse(content)

  case '.yaml':
    return yaml.loadAll(content).reduce((acc, doc) => {
      return assignIn(acc, doc)
    }, {})

  default:
    throw new Error('unsupported data format')
  }
}

export function parseFile(path: string): object {
  const content = fs.readFileSync(path).toString()
  return parseData(content, p.extname(path))
}

export function parseDatafile(dir: string, stage?: string): object {
  const formats = ['yaml', 'json']
  let result = {}

  formats.some(format => {
    const path = p.join(dir, `${stage ? '' : `${stage}.`}data.${format}`)

    if (doesFileExist(path)) {
      result = parseFile(path)
      return true
    }

    return false
  })

  return result
}
