import * as fs from 'fs'
import * as p from 'path'
import {doesFileExist, doesDirectoryExist} from '../utils/path'
import {parseFile} from '../utils/data'

export function findHelmRoot(): string {
  let path = process.cwd()

  function isHelmRoot(path: string): boolean {
    return doesFileExist(p.join(path, 'Chart.yaml')) &&
      doesFileExist(p.join(path, '.helmignore'))
  }

  if (process.env.HELMVALUES_CHART_HOME && doesDirectoryExist(process.env.HELMVALUES_CHART_HOME)) {
    if (isHelmRoot(process.env.HELMVALUES_CHART_HOME)) {
      return process.env.HELMVALUES_CHART_HOME
    }
  }

  while (path.length > 1)  {
    if (isHelmRoot(path)) {
      return path
    }
    path = p.dirname(path)
  }

  throw new Error('cannot find helm project root')
}

export function findSubchartValuesDir(): string[] {
  return fs.readdirSync(p.join(findHelmRoot(), 'values'), {withFileTypes: true}).filter((dirents) => dirents.isDirectory()).map((dirent) => dirent.name)
}

export function findInvalidCharts(charts: string[]): string[] {
    const dependencies = loadChartDependencies()
    return charts.filter((chart) => dependencies.find((dep) => {
      dep.name === chart
    }))
}

export function findInvalidPatchValues(charts: string[]): string[] {
    const valudesDir = p.join(findHelmRoot(), 'values')
    return charts
            .map((chart) => p.join(valudesDir, chart))
            .filter((path) => !doesFileExist(p.join(path, 'base.yaml'))
                              && !doesFileExist(p.join(path, 'base.json')))
}

export interface ChartDependency {
    name: string
    repository: string
    version: string
}

export function loadChartDependencies(): ChartDependency[] {
    const helmRoot = findHelmRoot()

    if (doesFileExist(p.join(helmRoot, 'Chart.yaml'))) {
        const requirements: { dependencies?: ChartDependency[] } = parseFile(p.join(helmRoot, 'Chart.yaml'))
        if (requirements.dependencies && requirements.dependencies.length > 0) {
            return requirements.dependencies
        }
    }

    if (doesFileExist(p.join(helmRoot, 'requirements.yaml'))) {
        const requirements: { dependencies?: ChartDependency[] } = parseFile(p.join(helmRoot, 'requirements.yaml'))
        if (requirements.dependencies && requirements.dependencies.length > 0) {
            return requirements.dependencies
        }
    }

    return []
}
