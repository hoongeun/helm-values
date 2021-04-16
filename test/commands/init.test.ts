import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import outdent from 'outdent'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot, validateFile, validateDirectory } from '../utils'

describe('init', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'init')
    cproc.execSync("helm create init", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'init')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['init'], {
      root: "../testbed/init/init-test"
  })
  .it('runs init', ctx => {
    expect(ctx.stdout).to.contain('Initiate successfully!')
  })
})
