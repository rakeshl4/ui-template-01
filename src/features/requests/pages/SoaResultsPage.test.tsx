import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { SoaResultsPage } from '@/features/requests/pages/SoaResultsPage'
import { buildExtraction, extractions } from '@/mocks/data'

const path = '/requests/:id/soa'
const SAMPLE_CAPTION =
  'Table 22-A Schedule of Assessments for Part A (Single Ascending Dose) Healthy Participants'

function tableHeading() {
  // The rail's "Tables (N)" is also an h2; the active table heading is the other one.
  return screen
    .getAllByRole('heading', { level: 2 })
    .find((h) => !h.textContent?.startsWith('Tables ('))
}

/** The mock serves one table; tests that need several add a copy under another caption. */
function addSecondTable(caption: string) {
  const [first] = extractions.get('REQ-1001')!
  const copy = structuredClone(first)
  extractions.set('REQ-1001', [
    first,
    { ...copy, id: 'REQ-1001-T2', soaTable: { ...copy.soaTable, caption } },
  ])
}

function savedTable(tableId: string) {
  return extractions.get('REQ-1001')!.find((r) => r.id === tableId)!.soaTable!
}

describe('SoaResultsPage', () => {
  beforeEach(() => {
    extractions.set('REQ-1001', buildExtraction('REQ-1001', new Date().toISOString()))
  })

  it('shows the extracted table', async () => {
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const nav = await screen.findByRole('navigation', { name: /extracted tables/i })
    expect(nav).toHaveTextContent('Tables (1)')
    expect(tableHeading()).toHaveTextContent(SAMPLE_CAPTION)
    expect(screen.getByText('Table 1 of 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('navigates between tables and opens the one named in the URL', async () => {
    addSecondTable('Part B Schedule of Assessments')
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, {
      route: '/requests/REQ-1001/soa?table=REQ-1001-T2',
      path,
    })

    expect(await screen.findByText('Table 2 of 2')).toBeInTheDocument()
    expect(tableHeading()).toHaveTextContent('Part B Schedule of Assessments')

    await user.click(screen.getByRole('button', { name: /prev/i }))
    expect(tableHeading()).toHaveTextContent(SAMPLE_CAPTION)

    await user.keyboard(']')
    expect(tableHeading()).toHaveTextContent('Part B Schedule of Assessments')
  })

  it('renders visits as columns and activities as rows from the extracted record', async () => {
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const grid = await screen.findByRole('grid', { name: SAMPLE_CAPTION })
    const [dayRow, windowRow] = within(grid).getAllByRole('row').slice(0, 2)
    // Only the visit fields present in the data get a header row.
    expect(within(grid).getAllByRole('row')).toHaveLength(2 + 35)
    expect(dayRow).toHaveTextContent(/^Day-28 to -2-11234714284256$/)
    expect(windowRow).toHaveTextContent(/^Window\+1\+1±3\+3±3$/)

    // Trailing footnote numbers are shown as superscript markers, not as part of the name.
    const vitals = within(grid).getByRole('rowheader', { name: /^Vital signs/ })
    expect(within(vitals).getByRole('button', { name: 'Footnote 15' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Vital signs at Day 7 (+1)', pressed: false }),
    ).toBeInTheDocument()
  })

  it('shows the footnote text when hovering a footnote reference', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const grid = await screen.findByRole('grid', { name: SAMPLE_CAPTION })
    const vitals = within(grid).getByRole('rowheader', { name: /^Vital signs/ })
    await user.hover(within(vitals).getByRole('button', { name: 'Footnote 15' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      /^Footnote 15: Participants should be resting in a supine/,
    )
  })

  it('toggles cells and saves the whole soaTable', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const cell = await screen.findByRole('button', { name: 'Vital signs at Day 7 (+1)' })
    await user.click(cell)
    expect(cell).toHaveAttribute('aria-pressed', 'true')
    expect(cell).toHaveTextContent('X')
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()

    // Toggling back is not a change.
    await user.click(cell)
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()

    // Keyboard: arrows move between cells, Space toggles.
    await user.click(cell)
    await user.keyboard('{ArrowRight}')
    const next = screen.getByRole('button', { name: 'Vital signs at Day 14 (+1)' })
    expect(next).toHaveFocus()
    await user.keyboard(' ')
    expect(next).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: /save all/i }))
    await waitFor(() => expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument())

    const saved = savedTable('REQ-1001-T1')
    expect(saved.scheduleItems).toEqual([
      { visitId: 'VISIT_DAY_14', procedureId: 'PROC_VITAL_SIGNS_15' },
      { visitId: 'VISIT_DAY_7', procedureId: 'PROC_VITAL_SIGNS_15' },
    ])
    // Everything else round-trips unchanged.
    expect(saved.visits).toHaveLength(11)
    expect(saved.procedures).toHaveLength(35)
    expect(saved.footnotes?.[2]).toEqual({
      footnoteId: '3',
      procedureIds: ['PROC_PRIOR_CONCOMITANT_MEDICATIONS_3', 'PROC_AE_MONITORING_3'],
      text: 'To be recorded throughout the study.',
    })
  })

  it('edits and saves footnotes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const footnote1 = await screen.findByRole('textbox', { name: 'Footnote 1' })
    await user.clear(footnote1)
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument()

    // Empty footnotes block saving.
    await user.click(screen.getByRole('button', { name: /save all/i }))
    expect(await screen.findByText('Footnote text is required')).toBeInTheDocument()

    await user.type(footnote1, 'Eligibility confirmed at screening.')
    await user.click(screen.getByRole('button', { name: /save all/i }))

    await waitFor(() => expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument())
    const saved = savedTable('REQ-1001-T1').footnotes!
    expect(saved).toHaveLength(28)
    expect(saved.slice(0, 2).map((f) => [f.footnoteId, f.text])).toEqual([
      ['1', 'Eligibility confirmed at screening.'],
      [
        '2',
        'Updated and reviewed against inclusion/exclusion criteria, prior to dose administration on Day 1.',
      ],
    ])
  })
})
