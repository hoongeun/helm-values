import * as fs from 'fs'
import * as p from 'path'


export function targetType(path: string): 'dir'|'file' {
  const stat = fs.lstatSync(path)

  if (stat.isFile()) {
    return 'file'
  }

  if (stat.isDirectory()) {
    return 'dir'
  }

  throw new Error('invalid target')
}

export function doesFileExist(path: string): boolean {
  try {
    const stat = fs.lstatSync(path)
    return stat.isFile()
  } catch (error) {
    return false
  }
}

export function doesDirectoryExist(path: string): boolean {
  try {
    const stat = fs.lstatSync(path)
    return stat.isDirectory()
  } catch (error) {
    return false
  }
}

export function checkInstalled (bin: string): boolean {
  const envPath = process.env.PATH ?? '';
  const envExt = process.env.PATHEXT ?? '';

  return envPath.replace(/["]+/g, '')
      .split(p.delimiter)
      .map((chunk) => {
          return envExt.split(p.delimiter).map((ext) => {
              return p.join(chunk, bin + ext);
          });
      }).some((candidates) => {
          return candidates.some((candidate) => {
              try {
                  return fs.statSync(candidate).isFile();
              } catch (error) {
                  return false;
              }
          })
      });
}
