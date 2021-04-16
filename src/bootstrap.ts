import {PrerequisiteError} from './errors/bootstrap';
import {checkInstalled} from './utils/path'

export function bootstrap() {
    checkPrerequisite()
}

function checkPrerequisite() {
    if (!checkInstalled('helm')) {
        throw new PrerequisiteError("helm")
    }
}