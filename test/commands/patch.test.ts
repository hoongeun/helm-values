import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as fs from 'fs'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {stripIndent} from 'common-tags'
import {testRoot, binPath, validateFile} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('patch', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'patch')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create patch', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })
    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'patch'),
    })

    fs.copyFileSync(
      p.join(testRoot(), 'commands', 'fixture', 'patch', 'Chart.yaml'),
      p.join(testRoot(), 'commands', 'testfield', 'patch', 'Chart.yaml'),
    )
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'patch')
    shelljs.rm('-rf', testfield)
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'patch'),
    })

    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'patch',
          'values',
          'mysql',
          'base.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'mysql',
          'base.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'patch',
          'values',
          'mysql',
          'prod.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'mysql',
          'prod.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'patch',
          'values',
          'redis',
          'base.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'redis',
          'base.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'patch',
          'values',
          'redis',
          'prod.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'redis',
          'prod.yaml',
        ),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['patch', '-s', 'prod'])
  .it('basic', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'mysql',
          'values.yaml',
        ),
        stripIndent`
        resources:
          requests:
            memory: 2048Mi
            cpu: 1024m
        metrics:
          enabled: true
        `,
      ) &&
          validateFile(
            p.join(
              testRoot(),
              'commands',
              'testfield',
              'patch',
              'values',
              'redis',
              'values.yaml',
            ),
            stripIndent`
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

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate -s dev test --no-base -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'patch'),
    })
    const copies = [
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'mysql', 'dev.yaml'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'dev.yaml'),
      },
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'redis', 'dev.json'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'dev.json'),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['patch', '-s', 'prod'])
  .catch('both base and stage file don\'t exist')
  .it('patch none')

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate -s dev prod test -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'patch'),
    })
    const copies = [
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'mysql', 'prod.yaml'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'prod.yaml'),
      },
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'mysql', 'base.json'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'base.json'),
      },
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'redis', 'prod.json'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'prod.json'),
      },
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'redis', 'base.yaml'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'base.yaml'),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
    fs.unlinkSync(p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'base.json'))
    fs.unlinkSync(p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'prod.yaml'))
  })
  .command(['patch', '-s', 'prod'])
  .it('patch different format', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'patch',
          'values',
          'mysql',
          'values.yaml',
        ),
        stripIndent`
        resources:
          requests:
            memory: 2048Mi
            cpu: 1024m
        metrics:
          enabled: true
        `) &&
        validateFile(
          p.join(
            testRoot(),
            'commands',
            'testfield',
            'patch',
            'values',
            'redis',
            'values.yaml',
          ),
          stripIndent`
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
          `),
    ).to.true
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate --no-base -s -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'patch'),
    })
    const copies = [
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'mysql', 'base.yaml'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'base.yaml'),
      },
      {
        src: p.join(testRoot(), 'commands', 'fixture', 'patch', 'values', 'redis', 'prod.json'),
        dest: p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'prod.json'),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['patch', '-s', 'prod'])
  .it('runs partial patch', () => {
    expect(
      validateFile(p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'mysql', 'values.yaml'),
        stripIndent`
        resources:
          requests:
            memory: 256Mi
            cpu: 100m
        metrics:
          enabled: false
        `) &&
        validateFile(p.join(testRoot(), 'commands', 'testfield', 'patch', 'values', 'redis', 'values.yaml'),
          stripIndent`
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
        `),
    ).to.true
  })
})
