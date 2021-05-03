import {expect, test} from '@oclif/test'
import * as p from 'path'
import {testRoot} from '../utils'
import {
  targetType,
  doesFileExist,
  doesDirectoryExist,
  checkInstalled,
} from '../../src/utils/path'

describe('targetType', () => {
  test.it('file', () => {
    expect(
      targetType(p.join(testRoot(), 'utils', 'fixture', 'path', 'file')),
    ).to.string('file')
  })

  test.it('directory', () => {
    expect(
      targetType(p.join(testRoot(), 'utils', 'fixture', 'path', 'directory')),
    ).to.string('dir')
  })

  test
  .do(() => {
    targetType(p.join(testRoot(), 'utils', 'fixture', 'path', 'non-exists'))
  })
  .catch(
    `ENOENT: no such file or directory, lstat '${testRoot()}/utils/fixture/path/non-exists'`,
  )
  .it('non-exists')
})

describe('doesFileExist', () => {
  test.it('exist file', () => {
    expect(
      doesFileExist(p.join(testRoot(), 'utils', 'fixture', 'path', 'file')),
    ).to.true
  })

  test.it('exist directory', () => {
    expect(
      doesDirectoryExist(
        p.join(testRoot(), 'utils', 'fixture', 'path', 'directory'),
      ),
    ).to.true
  })

  test.it('non-exist', () => {
    expect(
      doesFileExist(
        p.join(testRoot(), 'utils', 'fixture', 'path', 'non-exists'),
      ),
    ).to.false
  })
})

describe('doesDirectoryExist', () => {
  test.it('exist file', () => {
    expect(
      doesDirectoryExist(p.join(testRoot(), 'utils', 'fixture', 'path', 'file')),
    ).to.false
  })

  test.it('exist directory', () => {
    expect(
      doesDirectoryExist(
        p.join(testRoot(), 'utils', 'fixture', 'path', 'directory'),
      ),
    ).to.true
  })

  test.it('non-exist', () => {
    expect(
      doesDirectoryExist(
        p.join(testRoot(), 'utils', 'fixture', 'path', 'non-exists'),
      ),
    ).to.false
  })
})

describe('checkInstalled', () => {
  test.it('exist', () => {
    expect(checkInstalled('sh')).to.true
  })

  test.it('non-exist', () => {
    expect(
      checkInstalled('mock-binary-that-should-not-installed-in-your-system'),
    ).to.false
  })
})
