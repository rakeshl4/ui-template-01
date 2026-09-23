import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { ViewRequestPage } from '@/features/requests/pages/ViewRequestPage'

describe('ViewRequestPage', () => {
  it('renders the mocked request once it has loaded', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1001',
      path: '/requests/:id',
    })

    expect(await screen.findByText('Laptop replacement for finance team')).toBeInTheDocument()
    expect(screen.getByText('Priya Nathan')).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown id', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-9999',
      path: '/requests/:id',
    })

    expect(await screen.findByText(/request not found/i)).toBeInTheDocument()
  })
})
