import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {getContext, getBaseContext} from '../../src/lib/context'
import {testRoot, binPath} from '../utils'

describe('getContext', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(
      testRoot(),
      'lib',
      'testfield',
      'context',
    )
    cproc.execSync('helm create context', {
      cwd: p.join(testRoot(), 'lib', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'lib', 'testfield', 'context'),
    })
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'lib', 'testfield', 'context')
    shelljs.rm('-rf', testfield)
  })

  test.it('basic', () => {
    expect(getContext()).to.deep.equal({
      helmRoot: p.join(testRoot(), 'lib', 'testfield', 'context'),
      valuesDir: p.join(testRoot(), 'lib', 'testfield', 'context', 'values'),
      cwd: p.resolve(testRoot(), '..'),
      config: {
        stages: ['dev', 'prod', 'test'],
        format: 'yaml',
        combine: {
          template: 'auto',
        },
      },
    })
  })
})

describe('getBaseContext', () => {
  beforeEach(() => {
    process.env.HELMVALUES_CHART_HOME = p.join(
      testRoot(),
      'lib',
      'testfield',
      'context',
    )
    cproc.execSync('helm create context', {
      cwd: p.join(testRoot(), 'lib', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'lib', 'testfield', 'context'),
    })
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'lib', 'testfield', 'context')
    shelljs.rm('-rf', testfield)
  })

  test.it('basic', () => {
    expect(getBaseContext()).to.deep.equal({
      helmRoot: p.join(testRoot(), 'lib', 'testfield', 'context'),
      valuesDir: p.join(testRoot(), 'lib', 'testfield', 'context', 'values'),
      cwd: p.resolve(testRoot(), '..'),
    })
  })
})
