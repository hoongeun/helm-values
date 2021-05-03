enum CLIMARKER {
  CHARTMARKER = '--',
}

export function parseChart(argv: string[]): string[] {
  let charts: string[] = []

  const offset = argv.findIndex(arg => {
    return arg === CLIMARKER.CHARTMARKER
  })

  if (offset && argv.length > offset) {
    charts = argv.slice(offset)
  }

  return charts
}
