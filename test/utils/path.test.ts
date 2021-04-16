import { expect, test } from '@oclif/test'
import { targetType, doesFileExist, doesDirectoryExist, checkInstalled } from '../../src/utils/path'

describe('path utility', () => {
    test.it('targetType - file', () => {
        expect(targetType('./fixture/file')).to.string("file")
    })

    test.it('targetType - directory', () => {
        expect(targetType('./fixture/directory')).to.string("dir")
    })

    test.it('targetType - error', () => {
        expect(targetType('./fixture/nonexist')).throw("invalid target")
    })

    test.it('targetType - exist file', () => {
        expect(targetType('./fixture/file')).to.true
    })

    test.it('doesFileExist - exist file', () => {
        expect(doesFileExist('./fixture/file')).to.true
    })

    test.it('doesFileExist - exist directory', () => {
        expect(doesFileExist('./fixture/nofile')).to.false
    })

    test.it('doesFileExist - non-exist', () => {
        expect(doesFileExist('./fixture/non-exist')).to.false
    })

    test.it('doesDirectoryExist - exist file', () => {
        expect(doesDirectoryExist('./fixture/file')).to.false
    })

    test.it('doesDirectoryExist - exist directory', () => {
        expect(doesDirectoryExist('./fixture/directory')).to.true
    })

    test.it('doesDirectoryExist - non-exist', () => {
        expect(doesDirectoryExist('./fixture/non-exist')).to.false
    })

    test.it('checkInstalled - exist', () => {
        expect(checkInstalled('sh')).to.true
    })

    test.it('checkInstalled - non-exist', () => {
        expect(checkInstalled('mock-binary-that-should-not-exist-in-your-system')).to.false
    })
})