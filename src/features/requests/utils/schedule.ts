const SEPARATOR = '::'

/** Identifies one grid cell. Visit and procedure ids never contain the separator. */
export function cellKey(visitId: string, procedureId: string): string {
  return `${visitId}${SEPARATOR}${procedureId}`
}

export function parseCellKey(key: string): { visitId: string; procedureId: string } {
  const at = key.indexOf(SEPARATOR)
  return { visitId: key.slice(0, at), procedureId: key.slice(at + SEPARATOR.length) }
}

/** Sorted and de-duplicated, so two schedules can be compared element by element. */
export function normalizeSchedule(keys: string[]): string[] {
  return [...new Set(keys)].sort()
}

/** Adds the cell if it is absent, removes it if present. */
export function toggleCell(keys: string[], key: string): string[] {
  return keys.includes(key) ? keys.filter((k) => k !== key) : normalizeSchedule([...keys, key])
}

export function scheduleEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((k, i) => k === b[i])
}
