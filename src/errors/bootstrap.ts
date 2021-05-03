export class PrerequisiteError extends Error {
  constructor(target: string) {
    super(`${target} is not installed`)
  }
}
