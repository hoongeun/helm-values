import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as fs from 'fs'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {testRoot, binPath} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('clean', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'clean')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create clean', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'clean'),
    })
    fs.copyFileSync(
      p.join(testRoot(), 'commands', 'fixture', 'clean', 'Chart.yaml'),
      p.join(testRoot(), 'commands', 'testfield', 'clean', 'Chart.yaml'),
    )
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'clean')
    shelljs.rm('-rf', testfield)
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'clean'),
    })
  })
  .stdout()
  .command(['clean'])
  .it('basic', ctx => {
    expect(ctx.stdout).to.contain('Everything is clear now')
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'clean'),
    })
  })
  .stdout()
  .command(['clean', '-s', 'dev', 'prod'])
  .it('with extra stages', ctx => {
    expect(ctx.stdout).to.contain('Everything is clear now')
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C -- mysql`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'clean'),
    })
    shelljs.cp(
      '-r',
      p.join(testRoot(), 'commands', 'fixture', 'clean', 'subdir'),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'clean',
        'values',
        'mysql',
        'subdir',
      ),
    )
  })
  .command(['clean', '--remove-subdirectory', '--', 'mysql'])
  .it('with remove-subdirectory option', () => {
    expect(
      doesDirectoryExist(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'clean',
          'values',
          'subdir',
        ),
      ),
    ).to.false
  })
})
