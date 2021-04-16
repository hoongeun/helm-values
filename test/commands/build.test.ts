import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot } from '../utils'

describe('build', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'build')
    cproc.execSync("helm create build", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
    command(["init"])
    command(["generate -s dev -s prod -s test -s A -s B -s C"])
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'build')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['build'])
  .it('runs build', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['build', '--name', 'jeff'])
  .it('runs build --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
