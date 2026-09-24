import { describe, expect, it } from 'vitest'
import { procedureDisplayName } from '@/features/requests/utils/footnotes'
import { cellKey, parseCellKey, toggleCell } from '@/features/requests/utils/schedule'
import { buildVisitHeaderRows, visitLabel } from '@/features/requests/utils/visitHeaders'

describe('procedureDisplayName', () => {
  it('strips trailing references to the procedure’s own footnotes', () => {
    expect(procedureDisplayName('Vital signs15', ['15'])).toBe('Vital signs')
    expect(procedureDisplayName('COVID-19 test 10', ['10'])).toBe('COVID-19 test')
    expect(procedureDisplayName('Height, BMI, abdominal girth4', ['4'])).toBe(
      'Height, BMI, abdominal girth',
    )
  })

  it('leaves names alone when the trailing text is not one of its footnotes', () => {
    expect(procedureDisplayName('Blood samples for PK22', [])).toBe('Blood samples for PK22')
    expect(procedureDisplayName('Visit Day 15', ['5'])).toBe('Visit Day 15')
    expect(procedureDisplayName('Vital signs', ['s'])).toBe('Vital signs')
  })
})

describe('schedule cells', () => {
  it('toggles and keeps keys sorted', () => {
    const a = cellKey('V2', 'P1')
    const b = cellKey('V1', 'P1')
    expect(toggleCell([a], b)).toEqual([b, a])
    expect(toggleCell([b, a], b)).toEqual([a])
    expect(parseCellKey(a)).toEqual({ visitId: 'V2', procedureId: 'P1' })
  })
})

describe('buildVisitHeaderRows', () => {
  it('creates a row only for fields that some visit has, merging consecutive phases', () => {
    const rows = buildVisitHeaderRows([
      { id: 'A', phase: 'Screening', studyDay: '-28' },
      { id: 'B', phase: 'Treatment', studyDay: '1' },
      { id: 'C', phase: 'Treatment', studyDay: '8', visitWindow: '±1' },
    ])
    expect(rows.map((r) => r.label)).toEqual(['Phase', 'Day', 'Window'])
    expect(rows[0].cells.map((c) => [c.label, c.span])).toEqual([
      ['Screening', 1],
      ['Treatment', 2],
    ])
    expect(rows[2].cells.map((c) => c.label)).toEqual(['', '', '±1'])
  })

  it('falls back to the visit id for unlabelled visits', () => {
    expect(buildVisitHeaderRows([{ id: 'V1' }, { id: 'V2' }])[0].cells.map((c) => c.label)).toEqual(
      ['V1', 'V2'],
    )
    const rows = buildVisitHeaderRows([{ id: 'V1', phase: 'P' }, { id: 'V2' }])
    expect(rows[0].cells.map((c) => c.label)).toEqual(['P', 'V2'])
  })

  it('labels a visit for screen readers', () => {
    expect(visitLabel({ id: 'X', studyDay: '7', visitWindow: '+1' })).toBe('Day 7 (+1)')
    expect(visitLabel({ id: 'X' })).toBe('X')
  })
})
