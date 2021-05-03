import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {testRoot} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('init', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'init')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create init', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'init')
    shelljs.rm('-rf', testfield)
  })

  test
  .stdout()
  .command(['init'], {
    root: p.join(testRoot(), 'commands', 'testfield', 'init'),
  })
  .it('runs init', ctx => {
    expect(ctx.stdout).to.contain('Initiate helm-values!')
  })
})
