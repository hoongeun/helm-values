import {expect, test} from '@oclif/test'
import * as fs from 'fs'
import * as p from 'path'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {stripIndent} from 'common-tags'
import {testRoot, binPath, validateFile} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('merge', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'merge')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create merge', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'merge'),
    })
  })

  // afterEach(() => {
  //   const testfield = p.join(testRoot(), 'commands', 'testfield', 'merge')
  //   shelljs.rm('-rf', testfield)
  // })

  // test
  // .command(['merge'])
  // .catch('no values to merge')
  // .it('no values to merge')

  test.do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'merge'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
      },
    ]
    copies.forEach(cp => fs.copyFileSync(cp.src, cp.dest))
  })
  .command(['merge'])
  .it('basic', () => {
    expect(
      validateFile(
        p.join(testRoot(), 'commands', 'testfield', 'merge', 'values.yaml'),
        stripIndent`
        mysql:
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        redis:
          master:
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          slave:
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          sentinel:
            enabled: true
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          metrics:
            enabled: true
        `,
      ),
    ).to.true
  })

  test.do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'merge'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
      },
    ]
    copies.forEach(cp => fs.copyFileSync(cp.src, cp.dest))
  })
  .command(['merge', '--', 'mysql', 'redis'])
  .it('specify charts', () => {
    expect(
      validateFile(
        p.join(testRoot(), 'commands', 'testfield', 'merge', 'values.yaml'),
        stripIndent`
        mysql:
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        redis:
          master:
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          slave:
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          sentinel:
            enabled: true
            resources:
              requests:
                memory: 2048Mi
                cpu: 1024m
          metrics:
            enabled: true
        `,
      ),
    ).to.true
  })

  test.do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'merge'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
      },
    ]
    copies.forEach(cp => fs.copyFileSync(cp.src, cp.dest))
  })
  .command(['merge', '--', 'mysql'])
  .it('specify partial charts', () => {
    expect(
      validateFile(
        p.join(testRoot(), 'commands', 'testfield', 'merge', 'values.yaml'),
        stripIndent`
        mysql:
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        `,
      ),
    ).to.true
  })

  test.do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test A B C -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'merge'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'mysql',
          'values.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'merge',
          'values',
          'redis',
          'values.yaml',
        ),
      },
    ]
    copies.forEach(cp => fs.copyFileSync(cp.src, cp.dest))
  })
  .command(['merge', '--', 'postgres'])
  .catch('invalid chart: postgres')
  .it('specify invalid charts')
})
