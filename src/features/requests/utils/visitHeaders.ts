import type { SoaVisit } from '@/features/requests/schema'

type VisitField = 'phase' | 'period' | 'week' | 'studyDay' | 'hour' | 'visitWindow'

/** Header rows, outermost first. Grouping fields merge consecutive equal values into one cell. */
const VISIT_HEADER_FIELDS: { field: VisitField; label: string; group: boolean }[] = [
  { field: 'phase', label: 'Phase', group: true },
  { field: 'period', label: 'Period', group: true },
  { field: 'week', label: 'Week', group: true },
  { field: 'studyDay', label: 'Day', group: false },
  { field: 'hour', label: 'Hour', group: false },
  { field: 'visitWindow', label: 'Window', group: false },
]

export interface VisitHeaderCell {
  key: string
  label: string
  span: number
}

export interface VisitHeaderRow {
  key: string
  label: string
  cells: VisitHeaderCell[]
}

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0
}

/**
 * Builds the column header rows from whichever visit fields the table actually uses, so the
 * grid adapts to any protocol layout. A field only gets a row if at least one visit has it.
 */
export function buildVisitHeaderRows(visits: SoaVisit[]): VisitHeaderRow[] {
  const rows: VisitHeaderRow[] = VISIT_HEADER_FIELDS.filter(({ field }) =>
    visits.some((v) => hasValue(v[field])),
  ).map(({ field, label, group }) => {
    const cells: VisitHeaderCell[] = []
    visits.forEach((v, i) => {
      const value = v[field]?.trim() ?? ''
      const previous = cells[cells.length - 1]
      if (group && previous && previous.label === value) {
        previous.span += 1
      } else {
        cells.push({ key: `${field}-${i}`, label: value, span: 1 })
      }
    })
    return { key: field, label, cells }
  })

  // Visits with no labelled fields at all would get a blank column; show their id instead.
  const unlabelled = visits.map((v) => !VISIT_HEADER_FIELDS.some(({ field }) => hasValue(v[field])))
  if (unlabelled.some(Boolean)) {
    if (rows.length === 0) {
      rows.push({
        key: 'visitId',
        label: 'Visit',
        cells: visits.map((v, i) => ({ key: `visitId-${i}`, label: v.id, span: 1 })),
      })
    } else {
      // Put the ids in the innermost row, un-merging it first if it is a grouping row.
      const last = rows[rows.length - 1]
      const labels = last.cells.flatMap((c) => Array<string>(c.span).fill(c.label))
      last.cells = visits.map((v, i) => ({
        key: `${last.key}-${i}`,
        label: unlabelled[i] ? v.id : labels[i],
        span: 1,
      }))
    }
  }

  return rows
}

/** A short readable label for one visit, e.g. "Day 7 (+1)". Used for accessible cell names. */
export function visitLabel(visit: SoaVisit): string {
  const parts = [
    visit.phase,
    visit.period,
    hasValue(visit.week) ? `Week ${visit.week}` : undefined,
    hasValue(visit.studyDay) ? `Day ${visit.studyDay}` : undefined,
    hasValue(visit.hour) ? `Hour ${visit.hour}` : undefined,
  ].filter(hasValue)
  const label = parts.join(', ') || visit.id
  return hasValue(visit.visitWindow) ? `${label} (${visit.visitWindow})` : label
}
