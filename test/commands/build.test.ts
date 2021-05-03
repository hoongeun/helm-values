import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as fs from 'fs'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {stripIndent} from 'common-tags'
import {testRoot, binPath, validateFile} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('build', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'build')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create build', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })

    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'build'),
    })

    fs.copyFileSync(
      p.join(testRoot(), 'commands', 'fixture', 'build', 'Chart.yaml'),
      p.join(testRoot(), 'commands', 'testfield', 'build', 'Chart.yaml'),
    )
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'build')
    shelljs.rm('-rf', testfield)
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate --no-base -s -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'build'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'prod.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['build', '-s', 'prod'])
  .it('basic - njk template + [stage].data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values.yaml',
        ),
        stripIndent`
        mysql:
          level: stage
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        redis:
          level: stage
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
    cproc.execSync(
      `${binPath()} generate --no-base -s -- mysql redis`,
      {
        cwd: p.join(testRoot(), 'commands', 'testfield', 'build'),
      },
    )

    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'dev.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'dev.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'dev.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'dev.yaml.njk',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'dev.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'dev.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'dev.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'dev.yaml.njk',
        ),
      },
    ]

    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })

    const removes = [
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'build',
        'values.yaml',
      ),
    ]

    removes.forEach(r => {
      fs.unlinkSync(r)
    })
  })
  .command(['build', '-s', 'prod'])
  .catch('both base and stage file don\'t exist')
  .it("both data and template don't exist in specified stage")

  test
  .do(() => {
    cproc.execSync(
      `${binPath()} generate --no-base -s -- mysql redis`,
      {
        cwd: p.join(testRoot(), 'commands', 'testfield', 'build'),
      },
    )
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['build', '-s', 'prod'])
  .it('basic - template + [stage].data + chart.data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values.yaml',
        ),
        stripIndent`
        mysql:
          level: stage
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        redis:
          level: chart
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
    cproc.execSync(
      `${binPath()} generate --no-base -s -- mysql redis`,
      {
        cwd: p.join(testRoot(), 'commands', 'testfield', 'build'),
      },
    )
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'base.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
      },
    ]
    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['build', '-s', 'prod'])
  .it('basic - template + [stage].data + chart.data + global.data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'build',
          'values.yaml',
        ),
        stripIndent`
        mysql:
          level: stage
          resources:
            requests:
              memory: 2048Mi
              cpu: 1024m
          metrics:
            enabled: true
        redis:
          level: global
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
})
