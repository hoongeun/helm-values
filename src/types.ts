export type File = {
  name: string;
  content: string;
}

export type Engine = 'nunjucks'|'ejs'

export type Format = 'yaml'|'json'

export interface Config {
  stages: string[]
  format: Format
  combine: {
    engine: 'auto'|Engine
  }
}

export interface BaseContext {
  helmRoot: string
  valuesDir: string
  cwd: string
}

export interface Context extends BaseContext {
  config: Config
}
