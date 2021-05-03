import {expect, test} from '@oclif/test'
import * as p from 'path'
import * as fs from 'fs'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {stripIndent} from 'common-tags'
import {testRoot, binPath, validateFile} from '../utils'
import {doesDirectoryExist, doesFileExist} from '../../src/utils/path'

describe('combine', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'combine')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create combine', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })

    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'combine'),
    })

    fs.copyFileSync(
      p.join(testRoot(), 'commands', 'fixture', 'combine', 'Chart.yaml'),
      p.join(testRoot(), 'commands', 'testfield', 'combine', 'Chart.yaml'),
    )
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'combine')
    shelljs.rm('-rf', testfield)
  })

  test
  .do(() => {
    cproc.execSync(`${binPath()} generate --no-base -s -- mysql redis`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'combine'),
    })
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'combine',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
  .command(['combine', '-s', 'prod'])
  .it('basic - njk template + [stage].data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'mysql',
          'prod.yaml',
        ),
        stripIndent`
        # This is mysql chart prod template

        level: stage

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
          'combine',
          'values',
          'redis',
          'prod.yaml',
        ),
        stripIndent`
        # This is redis chart prod template

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
        cwd: p.join(testRoot(), 'commands', 'testfield', 'combine'),
      },
    )

    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'combine',
          'values',
          'mysql',
          'dev.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'dev.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'dev.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'dev.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'redis',
          'dev.yaml.njk',
        ),
      },
    ]

    copies.forEach(cp => {
      fs.copyFileSync(cp.src, cp.dest)
    })
  })
  .command(['combine', '-s', 'prod'])
  .it("both data and template don't exist in specified stage", () => {
    expect(
      !doesFileExist(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'mysql',
          'dev.yaml')) &&
      !doesFileExist(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'redis',
          'dev.yaml')),
    )
    .to.true
  })

  test
  .do(() => {
    cproc.execSync(
      `${binPath()} generate --no-base -s -- mysql redis`,
      {
        cwd: p.join(testRoot(), 'commands', 'testfield', 'combine'),
      },
    )
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'combine',
          'values',
          'mysql',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'base.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
  .command(['combine', '-s', 'prod'])
  .it('basic - template + [stage].data + chart.data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'mysql',
          'prod.yaml',
        ),
        stripIndent`
        # This is mysql chart prod template

        level: stage

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
          'combine',
          'values',
          'redis',
          'prod.yaml',
        ),
        stripIndent`
        # This is redis chart prod template

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
        cwd: p.join(testRoot(), 'commands', 'testfield', 'combine'),
      },
    )
    const copies = [
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'combine',
          'values',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'data.yaml',
        ),
      },
      {
        src: p.join(
          testRoot(),
          'commands',
          'fixture',
          'combine',
          'values',
          'mysql',
          'data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'base.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.data.yaml',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'mysql',
          'prod.yaml.ejs',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
          'combine',
          'values',
          'redis',
          'prod.yaml.njk',
        ),
        dest: p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
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
  .command(['combine', '-s', 'prod'])
  .it('basic - template + [stage].data + chart.data + global.data', () => {
    expect(
      validateFile(
        p.join(
          testRoot(),
          'commands',
          'testfield',
          'combine',
          'values',
          'mysql',
          'prod.yaml',
        ),
        stripIndent`
        # This is mysql chart prod template

        level: stage

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
          'combine',
          'values',
          'redis',
          'prod.yaml',
        ),
        stripIndent`
        # This is redis chart prod template

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
