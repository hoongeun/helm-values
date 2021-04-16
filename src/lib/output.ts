import * as fs from 'fs'
import * as p from 'path'
import {highlight} from './highlight'
import {File} from '../types'

export interface Output {
  path: string;
  content: string;
}

export type Lang = 'yaml'|'json'|'raw'

export type PrintOptions = {
  lang: 'auto'|Lang;
}

export const DefaultPrintOptions: PrintOptions = {
  lang: 'auto',
}

export function print(outputs: Output[], options?: Partial<PrintOptions>) {
  const printOptions: PrintOptions = Object.assign(DefaultPrintOptions, options)

  function getlang(output: Output, lang: 'auto'|Lang): Lang {
    switch (lang) {
    case 'auto': {
      switch (p.extname(output.path)) {
      case '.json':
        return 'json'
      case '.yml':
      case '.yaml':
        return 'yaml'
      default:
        return 'raw'
      }
    }
    case 'yaml':
    case 'json':
      return lang
    default:
      return 'raw'
    }
  }

  if (outputs.length === 1) {
    const lang = getlang(outputs[0], printOptions.lang)
    const toPrint = lang === 'raw' ? outputs[0].content : highlight(outputs[0].content, lang)
    console.log(toPrint)
  } else {
    const line = '-----------------------------------------------'
    console.log(outputs.map(f => {
      const lang = getlang(outputs[0], printOptions.lang)
      const toPrint = lang === 'raw' ? f.content : highlight(f.content, lang)
      return `${line}\n${f.path}\n${line}\n${toPrint}\n${line}`
    }).join('\n\n'))
  }
}

export function writeOutputs(outputs: Output[]) {
  outputs.forEach(f => {
    fs.writeFileSync(f.path, f.content)
  })
}

export function file2Output(file: File): Output {
  return {
    path: file.name,
    content: file.content,
  }
}
