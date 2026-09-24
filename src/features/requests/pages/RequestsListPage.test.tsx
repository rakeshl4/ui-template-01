import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { RequestsListPage } from '@/features/requests/pages/RequestsListPage'

describe('RequestsListPage', () => {
  it('filters the list by search text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RequestsListPage />)

    // The list renders both a desktop table and a mobile card list at once
    // (Tailwind hides one via CSS, which the test DOM doesn't evaluate), so
    // matches are asserted by count rather than a single element.
    expect(await screen.findAllByText('ONC-2041 Phase II NSCLC Protocol v3.0')).not.toHaveLength(0)

    await user.type(screen.getByLabelText(/search protocol documents/i), 'VACC-9001')

    expect(
      await screen.findAllByText('VACC-9001 Phase III Vaccine Efficacy Protocol v4.0'),
    ).not.toHaveLength(0)
    expect(screen.queryAllByText('ONC-2041 Phase II NSCLC Protocol v3.0')).toHaveLength(0)
  })
})
