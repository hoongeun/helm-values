import * as p from 'path'
import * as fs from 'fs'
import {BatchOperator} from './base'
import {doesDirectoryExist, doesFileExist} from '../utils/path'

export type CleanTarget = {
  chart: string
}

export type CleanResult = void

export class Cleaner extends BatchOperator<CleanTarget, CleanResult> {
  action(target: CleanTarget): CleanResult {
    if (doesDirectoryExist(this.context.valuesDir)) {
      const re = new RegExp(/^(?!\.base|\.dev|\.prod|\.test)\.(yaml|json|njk|ejs)$/)
      const dataRe = new RegExp(/^\.data\.(yaml|json)$/)
      const dirents = fs.readdirSync(this.context.valuesDir, {withFileTypes: true})

      dirents.filter(d => {
        if (!d.isFile()) {
          return false
        }

        if (!re.test(d.name)) {
          return false
        }

        if (dataRe.test(d.name)) {
          // remove data which has no manifest
          const manifestRe = new RegExp(`${d.name}(\\.base|\\.dev|\\.prod|\\.test)\\.(yaml|json|njk|ejs)`)
          if (!dirents.some(d =>
            manifestRe.test(d.name)
          )) {
            return false
          }
        }

        // TODO: remove manifest files who has template and data.

        return true
      }).forEach(d => fs.unlinkSync(p.join(this.context.valuesDir, d.name)))
    }
  }
}

