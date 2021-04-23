import * as fs from 'fs'
import * as p from 'path'
import { doesFileExist, doesDirectoryExist } from '../utils/path'
import { parseFile } from '../utils/data'

export function findHelmRoot(): string {
  let path = process.cwd()

  function isHelmRoot(path: string): boolean {
    return doesFileExist(p.join(path, 'Chart.yaml')) &&
      doesFileExist(p.join(path, '.helmignore'))
  }

  if (process.env.HELMVALUES_CHART_HOME
      && doesDirectoryExist(process.env.HELMVALUES_CHART_HOME)) {
    if (isHelmRoot(process.env.HELMVALUES_CHART_HOME)) {
      return process.env.HELMVALUES_CHART_HOME
    }
  }

  while (path.length > 1) {
    if (isHelmRoot(path)) {
      return path
    }
    path = p.dirname(path)
  }

  throw new Error('cannot find helm project root')
}

export function findSubchartValuesDir(): string[] {
  return fs.readdirSync(p.join(findHelmRoot(), 'values'), { withFileTypes: true }).filter((dirents) => dirents.isDirectory()).map((dirent) => dirent.name)
}

export function findUninstalledSubcharts(charts: string[]): string[] {
  const dependencies = loadChartDependencies()
  return charts.filter((chart) =>
    dependencies.find((dep) => dep.name === chart) === undefined)
}

export function findInvalidPatchValues(stage: string, charts: string[]): string[] {
  const re = new RegExp(`^(${stage}|base)\.(yaml|json)$`)
  return charts
    .filter((chart) => {
      const patchables = fs
        .readdirSync(p.join(findHelmRoot(), 'values', chart), { withFileTypes: true})
        .filter((dirent) => dirent.isFile() && re.test(dirent.name))
      return patchables.length === 0
    })
}

export interface ChartDependency {
  name: string
  repository: string
  version: string
}

export function loadChartDependencies(): ChartDependency[] {
  const helmRoot = findHelmRoot()

  // >= v3
  if (doesFileExist(p.join(helmRoot, 'Chart.yaml'))) {
    const requirements: { dependencies?: ChartDependency[] } = parseFile(p.join(helmRoot, 'Chart.yaml'))
    if (requirements.dependencies && requirements.dependencies.length > 0) {
      return requirements.dependencies
    }
  }

  // <= v2
  if (doesFileExist(p.join(helmRoot, 'requirements.yaml'))) {
    const requirements: { dependencies?: ChartDependency[] } = parseFile(p.join(helmRoot, 'requirements.yaml'))
    if (requirements.dependencies && requirements.dependencies.length > 0) {
      return requirements.dependencies
    }
  }

  return []
}

export interface SubChart {
  name: string
  data: string[]
  values: string[]
  stages: { [stage: string]: StageGroup }
}

export interface StageGroup {
  values: string[]
  data: string[]
  template: string[]
}

export function groupByStage(chart: string): SubChart {
  const data: string[] = []
  const values: string[] = []
  const stages = fs
    .readdirSync(p.join(findHelmRoot(), "values", chart), { withFileTypes: true })
    .filter((d) => {
      if (!d.isFile()) {
        return false
      }

      if (/^data.(yaml|json)$/.test(d.name)) {
        data.push(d.name)
        return false
      }

      if (/^values.(yaml|json)$/.test(d.name)) {
        values.push(d.name)
        return false
      }

      return true

    })
    .reduce((acc, dirent) => {
      const dataRe = new RegExp(/^(\w+)\.data\.(yaml|json)$/)
      const dataMatches = dirent.name.match(dataRe)

      if (dataMatches !== null && dataMatches.length > 0) {
        if (dataMatches[1] !== 'data' && !acc[dataMatches[1]]) {
          acc[dataMatches[1]] = {
            values: [],
            data: [],
            template: []
          }
        }

        acc[dataMatches[1]].data.push(dirent.name)

        return acc
      }

      const templateRe = new RegExp(/^(\w+)\.(yaml|json)\.(njk|ejs)$/)
      const templateMatches = dirent.name.match(templateRe)

      if (templateMatches !== null && templateMatches.length > 0) {
        if (templateMatches[1] !== 'data' && !acc[templateMatches[1]]) {
          acc[templateMatches[1]] = {
            values: [],
            data: [],
            template: []
          }
        }

        acc[templateMatches[1]].template.push(dirent.name)

        return acc
      }

      const valuesRe = new RegExp(/^(\w+)\.(yaml|json)$/)
      const valuesMatches = dirent.name.match(valuesRe)

      if (valuesMatches !== null && valuesMatches.length > 0) {
        if (!acc[valuesMatches[1]]) {
          acc[valuesMatches[1]] = {
            values: [],
            data: [],
            template: []
          }
        }

        acc[valuesMatches[1]].values.push(dirent.name)

        return acc
      }

      return acc
    }, {} as { [name: string]: StageGroup })

    return {
      name: chart,
      data,
      values,
      stages,
    }
}
