import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot } from '../utils'

describe('patch', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'patch')
    cproc.execSync("helm create patch", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
    command(["init"])
    command(["generate -s dev -s prod -s test -s A -s B -s C"])
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'patch')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['patch'])
  .it('runs patch', ctx => {
    expect(ctx.stdout).to.contain('patch world')
  })

  test
  .stdout()
  .command(['patch', '--name', 'jeff'])
  .it('runs patch --name jeff', ctx => {
    expect(ctx.stdout).to.contain('patch jeff')
  })
})
