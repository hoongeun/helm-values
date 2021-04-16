import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot } from '../utils'

describe('clean', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'clean')
    cproc.execSync("helm create clean", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
    command(["init"])
    command(["generate -s dev -s prod -s test -s A -s B -s C"])
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'clean')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['clean'])
  .it('runs clean', ctx => {
    expect(ctx.stdout).to.contain('clean world')
  })
})
