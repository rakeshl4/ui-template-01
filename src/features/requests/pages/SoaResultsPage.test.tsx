import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { SoaResultsPage } from '@/features/requests/pages/SoaResultsPage'
import { extractions } from '@/mocks/data'

const path = '/requests/:id/soa'

function tableHeading() {
  // The rail's "Tables (N)" is also an h2; the active table heading is the other one.
  return screen
    .getAllByRole('heading', { level: 2 })
    .find((h) => !h.textContent?.startsWith('Tables ('))
}

describe('SoaResultsPage', () => {
  it('lists the extracted tables and navigates between them', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const nav = await screen.findByRole('navigation', { name: /extracted tables/i })
    expect(nav).toHaveTextContent('Tables (4)')
    expect(tableHeading()).toHaveTextContent('Screening and Baseline')
    expect(screen.getByText('Table 1 of 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(tableHeading()).toHaveTextContent('Treatment Period')
    expect(screen.getByText('Table 2 of 4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /pharmacokinetic sampling/i }))
    expect(tableHeading()).toHaveTextContent('Pharmacokinetic Sampling')

    await user.keyboard(']')
    expect(tableHeading()).toHaveTextContent('End of Treatment and Follow-up')
  })

  it('opens the table named in the URL', async () => {
    renderWithProviders(<SoaResultsPage />, {
      route: '/requests/REQ-1001/soa?table=REQ-1001-T3',
      path,
    })

    expect(await screen.findByText('Table 3 of 4')).toBeInTheDocument()
    expect(tableHeading()).toHaveTextContent('Pharmacokinetic Sampling')
  })

  it('edits and saves footnotes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SoaResultsPage />, { route: '/requests/REQ-1001/soa', path })

    const footnoteA = await screen.findByRole('textbox', { name: 'Footnote a' })
    await user.clear(footnoteA)
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument()

    // Empty footnotes block saving.
    await user.click(screen.getByRole('button', { name: /save all/i }))
    expect(await screen.findByText('Footnote text is required')).toBeInTheDocument()

    await user.type(footnoteA, 'Updated screening window')
    await user.click(screen.getByRole('button', { name: /save all/i }))

    await waitFor(() => expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument())
    const saved = extractions.get('REQ-1001')!.tables[0].footnotes
    expect(saved.map((f) => [f.marker, f.text])).toEqual([
      ['a', 'Updated screening window'],
      ['b', 'Informed consent must be obtained before any study-specific procedure.'],
      ['c', 'Pregnancy test for women of childbearing potential only.'],
    ])
  })
})
