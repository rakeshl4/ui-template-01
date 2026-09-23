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
    expect(await screen.findAllByText('Laptop replacement for finance team')).not.toHaveLength(0)

    await user.type(screen.getByLabelText(/search requests/i), 'VPN access')

    expect(await screen.findAllByText('VPN access request for new contractor')).not.toHaveLength(0)
    expect(screen.queryAllByText('Laptop replacement for finance team')).toHaveLength(0)
  })
})
