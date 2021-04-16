import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot } from '../utils'

describe('merge', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'merge')
    cproc.execSync("helm create merge", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
    command(["init"])
    command(["generate -s dev -s prod -s test -s A -s B -s C"])
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'merge')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['merge'])
  .it('runs merge', ctx => {
    expect(ctx.stdout).to.contain('merge world')
  })

  test
  .stdout()
  .command(['merge', '--name', 'jeff'])
  .it('runs merge --name jeff', ctx => {
    expect(ctx.stdout).to.contain('merge jeff')
  })
})
