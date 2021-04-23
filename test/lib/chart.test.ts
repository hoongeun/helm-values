import { expect, test, command } from '@oclif/test'
import * as fs from 'fs'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot, binPath } from '../utils'
import { findSubchartValuesDir, findUninstalledSubcharts, findInvalidPatchValues, groupByStage } from '../../src/lib/chart'

// describe('findSubchartValuesDir', () => {
//   beforeEach(() => {
//     process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     cproc.execSync("helm create chart", {
//       cwd: p.join(testRoot(), 'lib', 'testfield'),
//     })
//     cproc.execSync(`${binPath()} init`, {
//       cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//     })
//   })

//   afterEach(() => {
//     const testfield = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     shelljs.rm("-rf", testfield)
//   })

//   test
//     .it('refering chart.yaml', () => {
//       fs.copyFileSync(p.join(testRoot(), 'lib', 'fixture', 'chart', 'Chart.yaml'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'Chart.yaml'))
//       cproc.execSync(`${binPath()} generate -s dev prod test A B C`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//       expect(findSubchartValuesDir()).to.have.members(['mysql', 'redis'])
//     })

//   test
//     .it('specifying the charts', () => {
//       cproc.execSync(`${binPath()} generate -s dev prod test A B C -- redis postgres`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//       expect(findSubchartValuesDir()).to.have.members(['postgres', 'redis'])
//     })
// })

// describe('findUninstalledSubcharts', () => {
//   beforeEach(() => {
//     process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     cproc.execSync("helm create chart", {
//       cwd: p.join(testRoot(), 'lib', 'testfield'),
//     })
//     cproc.execSync(`${binPath()} init`, {
//       cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//     })
//     fs.copyFileSync(p.join(testRoot(), 'lib', 'fixture', 'chart', 'Chart.yaml'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'Chart.yaml'))
//     cproc.execSync(`${binPath()} generate -s dev prod test A B C`, {
//       cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//     })
//   })

//   afterEach(() => {
//     const testfield = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     shelljs.rm("-rf", testfield)
//   })

//   test
//     .it('all installed', () => {
//       expect(findUninstalledSubcharts(['mysql', 'redis'])).to.have.members([])
//     })

//   test
//     .it('some installed', () => {
//       expect(findUninstalledSubcharts(['postgres', 'redis'])).to.have.members(['postgres'])
//     })

//   test
//     .it('uninstalled only', () => {
//       expect(findUninstalledSubcharts(['postgres'])).to.have.members(['postgres'])
//     })
// })

// describe('findInvalidPatchValues', () => {
//   beforeEach(() => {
//     process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     cproc.execSync("helm create chart", {
//       cwd: p.join(testRoot(), 'lib', 'testfield'),
//     })
//     cproc.execSync(`${binPath()} init`, {
//       cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//     })
//   })

//   afterEach(() => {
//     const testfield = p.join(testRoot(), 'lib', 'testfield', 'chart')
//     shelljs.rm("-rf", testfield)
//   })

//   test
//     .do(() => {
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
//       fs.copyFileSync(p.join(testRoot(), 'lib', 'fixture', 'chart', 'Chart.yaml'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'Chart.yaml'))
//       cproc.execSync(`${binPath()} generate -s dev -s prod -s test -s A -s B -s C`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//     })
//     .it('both([stage].yaml, base.yaml)', () => {
//       expect(findInvalidPatchValues('dev', ['redis', 'mysql'])).to.deep.equal([])
//     })

//   test
//     .do(() => {
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
//       fs.copyFileSync(p.join(testRoot(), 'lib', 'fixture', 'chart', 'Chart.yaml'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'Chart.yaml'))
//       cproc.execSync(`${binPath()} generate --base-only`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//     })
//     .it('baes.yaml only', () => {
//       expect(findInvalidPatchValues('dev', ['redis', 'mysql'])).to.deep.equal([])
//     })

//   test
//     .do(() => {
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
//       fs.copyFileSync(p.join(testRoot(), 'lib', 'fixture', 'chart', 'Chart.yaml'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'Chart.yaml'))
//       cproc.execSync(`${binPath()} generate -s dev --no-base`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//       expect(findInvalidPatchValues('dev', ['redis', 'mysql'])).to.deep.equal([])
//     })
//     .it('[stage].yaml only')

//   test
//     .do(() => {
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
//       shelljs.mkdir('-p', p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
//       cproc.execSync(`${binPath()} generate -s prod --no-base -- redis mysql`, {
//         cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
//       })
//       expect(findInvalidPatchValues('dev', ['redis', 'mysql'])).to.deep.equal(['redis', 'mysql'])
//     })
//     .it('invalid')
// })

describe('groupByStage', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'lib', 'testfield', 'chart')
    cproc.execSync("helm create chart", {
      cwd: p.join(testRoot(), 'lib', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'lib', 'testfield', 'chart'),
    })
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'lib', 'testfield', 'chart')
    shelljs.rm("-rf", testfield)
  })

  test
    .do(() => {
      shelljs.cp('-r', p.join(testRoot(), 'lib', 'fixture', 'chart', 'mysql'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
      expect(groupByStage('mysql')).to.deep.equal({
        name: 'mysql',
        data: ['data.json', 'data.yaml'],
        values: ['values.json', 'values.yaml'],
        stages: {
          base: {
            data: [],
            template: ["base.json.ejs", "base.json.njk", "base.yaml.ejs", "base.yaml.njk"],
            values: ["base.json", "base.yaml"]
          },
          dev: {
            data: [],
            template: ["dev.json.ejs", "dev.json.njk", "dev.yaml.ejs", "dev.yaml.njk"],
            values: ["dev.json", "dev.yaml"]
          },
          prod: {
            data: [],
            template: ["prod.json.ejs", "prod.json.njk", "prod.yaml.ejs", "prod.yaml.njk"],
            values: ["prod.json", "prod.yaml"]
          },
          test: {
            data: [],
            template: ["test.json.ejs", "test.json.njk", "test.yaml.ejs", "test.yaml.njk"],
            values: ["test.json", "test.yaml"]
          }
        }
      })
    })
    .it('mysql')

    test
      .do(() => {
        shelljs.cp('-r', p.join(testRoot(), 'lib', 'fixture', 'chart', 'redis'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
        expect(groupByStage('redis')).to.deep.equal({
          name: 'redis',
          data: ['data.json', 'data.yaml'],
          values: ['values.json', 'values.yaml'],
          stages: {
            base: {
              data: [],
              template: ["base.json.ejs", "base.json.njk", "base.yaml.ejs", "base.yaml.njk"],
              values: ["base.json", "base.yaml"]
            },
            dev: {
              data: [],
              template: ["dev.json.ejs", "dev.json.njk", "dev.yaml.ejs", "dev.yaml.njk"],
              values: ["dev.json", "dev.yaml"]
            },
            prod: {
              data: [],
              template: ["prod.json.ejs", "prod.json.njk", "prod.yaml.ejs", "prod.yaml.njk"],
              values: ["prod.json", "prod.yaml"]
            },
            test: {
              data: [],
              template: ["test.json.ejs", "test.json.njk", "test.yaml.ejs", "test.yaml.njk"],
              values: ["test.json", "test.yaml"]
            }
          }
        })
      })
      .it('redis')

  test
    .do(() => {
      shelljs.cp('-r', p.join(testRoot(), 'lib', 'fixture', 'chart', 'mysql'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'mysql'))
      shelljs.cp('-r', p.join(testRoot(), 'lib', 'fixture', 'chart', 'redis'), p.join(testRoot(), 'lib', 'testfield', 'chart', 'values', 'redis'))
      groupByStage('postgres')
    })
    .catch(`ENOENT: no such file or directory, scandir '${testRoot()}/lib/testfield/chart/values/postgres'`)
    .it('invalid chart')
})
