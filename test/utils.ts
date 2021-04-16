import * as fs from 'fs'

export function validateFile(path: string, content: string|Buffer): boolean {
    try {
        const buff = fs.readFileSync(path)

        if (typeof content == 'string') {
            return buff.toString() === content;
        }

        return buff.equals(content)
    } catch (e) {
        return false;
    }
}

export function validateDirectory(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

export function testRoot(): string {
    return __dirname
}