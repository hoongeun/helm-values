import {expect, test, command} from '@oclif/test'
import * as p from 'path'
import outdent from 'outdent'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import { testRoot, validateFile, validateDirectory } from '../utils'

describe('generate', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(testRoot(), 'commands', 'fixture', 'generate')
    cproc.execSync("helm create generate", {
      cwd: p.join(testRoot(), 'commands', 'fixture'),
    })
    command(["init"])
  })

  afterEach(() => {
    const testbed = p.join(testRoot(), 'commands', 'fixture', 'generate')
    shelljs.rm("-rf", testbed)
  })

  test
  .stdout()
  .command(['generate -s dev -s prod'])
  .it('runs generate', ctx => {
    expect(ctx.stdout).to.contain('Generate successfully!')
  })

  test
  .stdout()
  .command(['generate -s dev -s prod -s test mysql redis'])
  .it('runs generate', ctx => {
    const valuesDir = p.join(testRoot(), "testbed", "generate", "values")
    expect(ctx.stdout).to.contain('Generate successfully!')
    expect(validateFile(p.join(valuesDir, "mysql", "base.yaml"), outdent`
      # This is mysql chart base values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "mysql", "dev.yaml"), outdent`
      # This is mysql chart dev values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "mysql", "prod.yaml"), outdent`
      # This is mysql chart prod values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "mysql", "test.yaml"), outdent`
      # This is mysql chart test values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "redis", "base.yaml"), outdent`
      # This is redis chart base values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "redis", "dev.yaml"), outdent`
      # This is redis chart dev values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "redis", "prod.yaml"), outdent`
      # This is redis chart prod values
      `)).to.true
    expect(validateFile(p.join(valuesDir, "redis", "test.yaml"), outdent`
      # This is redis chart test values
      `)).to.true
  })
})
