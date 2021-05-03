import {expect, test} from '@oclif/test'
import * as p from 'path'
import {stripIndent} from 'common-tags'
import * as cproc from 'child_process'
import * as shelljs from 'shelljs'
import {testRoot, validateFile, binPath} from '../utils'
import {doesDirectoryExist} from '../../src/utils/path'

describe('generate by refering chart.yaml', () => {
  beforeEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'generate')

    process.env.HELMVALUES_CHART_HOME = testfield

    if (doesDirectoryExist(testfield)) {
      shelljs.rm('-rf', testfield)
    }

    cproc.execSync('helm create generate', {
      cwd: p.join(testRoot(), 'commands', 'testfield'),
    })

    cproc.execSync(`${binPath()} init`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })
  })

  afterEach(() => {
    const testfield = p.join(testRoot(), 'commands', 'testfield', 'generate')
    shelljs.rm('-rf', testfield)
  })

  test
  .command(['generate'])
  .catch('no charts to generate')
  .it('no charts to generate')

  test
  .do(() => {
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
  })
  .stdout()
  .command(['generate'])
  .it(
    'runs generate by refering .helmvalues and requirments.yaml < v3',
    ctx => {
      expect(ctx.stdout).to.contain('Generate mysql, redis successfully!')
    },
  )

  test
  .do(() => {
    shelljs.cp(
      p.join(testRoot(), 'commands', 'fixture', 'generate', 'Chart.yaml'),
      p.join(testRoot(), 'commands', 'testfield', 'generate', 'Chart.yaml'),
    )
  })
  .stdout()
  .command(['generate'])
  .it('runs generate by refering .helmvalues and Chart.yaml >= v3', ctx => {
    expect(ctx.stdout).to.contain('Generate mysql, redis successfully!')
  })

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.yaml'),
        stripIndent`
        # This is mysql chart base values
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.yaml'),
            stripIndent`
        # This is mysql chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.yaml'),
            stripIndent`
        # This is mysql chart prod values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'test.yaml'),
            stripIndent`
        # This is mysql chart test values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.yaml'),
            stripIndent`
        # This is redis chart base values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.yaml'),
            stripIndent`
        # This is redis chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.yaml'),
            stripIndent`
        # This is redis chart prod values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'test.yaml'),
            stripIndent`
        # This is redis chart test values
        `,
          ),
    ).to.true
  })
  .it('genreate with yaml format by refering requirements.yaml')

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -f json`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.json'),
        stripIndent`
        {
        }
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'test.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'test.json'),
            stripIndent`
        {
        }
        `,
          ),
    ).to.true
  })
  .it('genreate with json format by refering Chart.yaml ')

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -s dev prod`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.yaml'),
        stripIndent`
        # This is mysql chart base values
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.yaml'),
            stripIndent`
        # This is mysql chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.yaml'),
            stripIndent`
        # This is mysql chart prod values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.yaml'),
            stripIndent`
        # This is redis chart base values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.yaml'),
            stripIndent`
        # This is redis chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.yaml'),
            stripIndent`
        # This is redis chart prod values
        `,
          ),
    ).to.true
  })
  .it(
    'genreate only dev, prod stages with yaml format by refering requirements.yaml ',
  )

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -f json -s dev prod`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.json'),
        stripIndent`
        {
        }
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ),
    ).to.true
  })
  .it(
    'genreate only dev, prod stages with json format by refering Chart.yaml',
  )

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -s dev prod -- redis postgres`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'postgres', 'base.yaml'),
        stripIndent`
        # This is postgres chart base values
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'postgres', 'dev.yaml'),
            stripIndent`
        # This is postgres chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'postgres', 'prod.yaml'),
            stripIndent`
        # This is postgres chart prod values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.yaml'),
            stripIndent`
        # This is redis chart base values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.yaml'),
            stripIndent`
        # This is redis chart dev values
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.yaml'),
            stripIndent`
        # This is redis chart prod values
        `,
          ),
    ).to.true
  })
  .it('genreate only dev, prod stages with yaml format by refering argv')

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(
      `${binPath()} generate -f json -s dev prod -- postgres redis`,
      {
        cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
      },
    )

    expect(
      validateFile(
        p.join(valuesDir, 'postgres', 'base.json'),
        stripIndent`
        {
        }
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'postgres', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'postgres', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.json'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.json'),
            stripIndent`
        {
        }
        `,
          ),
    ).to.true
  })
  .it('genreate only dev, prod stages with json format by refering argv')

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -s dev prod -t njk`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.yaml.njk'),
        stripIndent`
        # This is mysql chart base template
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.yaml.njk'),
            stripIndent`
        # This is mysql chart dev template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.yaml.njk'),
            stripIndent`
        # This is mysql chart prod template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.yaml.njk'),
            stripIndent`
        # This is redis chart base template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.yaml.njk'),
            stripIndent`
        # This is redis chart dev template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.yaml.njk'),
            stripIndent`
        # This is redis chart prod template
        `,
          ),
    ).to.true
  })
  .it(
    'genreate only dev, prod stages with yaml.njk by refering requirements.yaml ',
  )

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -f json -s dev prod -t njk`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.json.njk'),
        stripIndent`
        {
        }
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.json.njk'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.json.njk'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.json.njk'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.json.njk'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.json.njk'),
            stripIndent`
        {
        }
        `,
          ),
    ).to.true
  })
  .it('genreate only dev, prod stages with json.njk by refering Chart.yaml')

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -s dev prod -t ejs`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.yaml.ejs'),
        stripIndent`
        # This is mysql chart base template
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.yaml.ejs'),
            stripIndent`
        # This is mysql chart dev template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.yaml.ejs'),
            stripIndent`
        # This is mysql chart prod template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.yaml.ejs'),
            stripIndent`
        # This is redis chart base template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.yaml.ejs'),
            stripIndent`
        # This is redis chart dev template
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.yaml.ejs'),
            stripIndent`
        # This is redis chart prod template
        `,
          ),
    ).to.true
  })
  .it(
    'genreate only dev, prod stages with yaml.njk by refering requirements.yaml ',
  )

  test
  .do(() => {
    const valuesDir = p.join(
      testRoot(),
      'commands',
      'testfield',
      'generate',
      'values',
    )
    shelljs.cp(
      p.join(
        testRoot(),
        'commands',
        'fixture',
        'generate',
        'requirements.yaml',
      ),
      p.join(
        testRoot(),
        'commands',
        'testfield',
        'generate',
        'requirements.yaml',
      ),
    )
    cproc.execSync(`${binPath()} generate -f json -s dev prod -t ejs`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })

    expect(
      validateFile(
        p.join(valuesDir, 'mysql', 'base.json.ejs'),
        stripIndent`
        {
        }
        `,
      ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'dev.json.ejs'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'mysql', 'prod.json.ejs'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'base.json.ejs'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'dev.json.ejs'),
            stripIndent`
        {
        }
        `,
          ) &&
          validateFile(
            p.join(valuesDir, 'redis', 'prod.json.ejs'),
            stripIndent`
        {
        }
        `,
          ),
    ).to.true
  })
  .it('genreate only dev, prod stages with json.ejs by refering Chart.yaml')

  test
  .do(() => {
    cproc.execSync(`${binPath()} -s dev prod -f invalidformat`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })
  })
  .catch(/Command failed: .*/)
  .it('runs generate with invalid format')

  test
  .do(() => {
    cproc.execSync(`${binPath()} -s dev prod -t invalidtemplate`, {
      cwd: p.join(testRoot(), 'commands', 'testfield', 'generate'),
    })
  })
  .catch(/Command failed: .*/)
  .it('runs generate with invalid template')
})
