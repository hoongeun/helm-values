import * as fs from 'fs'
import * as p from 'path'
import * as yaml from 'js-yaml'

export function parseData(content: string, ext: string): object {
  switch (ext) {
  case '.json':
    return JSON.parse(content)

  case '.yaml':
    return yaml.loadAll(content).reduce((acc, doc) => {
      return Object.assign(acc, doc)
    }, {})

  default:
    throw new Error('unsupported data format')
  }
}

export function parseFile(path: string): object {
  const content = fs.readFileSync(path).toString()
  return parseData(content, p.extname(path))
}
