import * as fs from 'fs'
import * as p from 'path'
import * as os from 'os'
import * as Diff from 'diff'

export function validateFile(path: string, content: string | Buffer): boolean {
  try {
    const buff = fs.readFileSync(path).toString()

    if (buff.toString().trim() === content.toString().trim()) {
      return true
    }

    console.info(Diff.diffWordsWithSpace(buff.toString().trim(), content.toString().trim()))
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export function validateDirectory(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory()
  } catch (error) {
    return false
  }
}

export function testRoot(): string {
  return __dirname
}

export function binPath(): string {
  if (os.platform() === 'win32') {
    return p.resolve(p.join(__dirname, '..', 'bin', 'run.cmd'))
  }

  return p.resolve(p.join(__dirname, '..', 'bin', 'run'))
}
