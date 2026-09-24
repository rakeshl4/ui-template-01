import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { ViewRequestPage } from '@/features/requests/pages/ViewRequestPage'
import { requests } from '@/mocks/data'

describe('ViewRequestPage', () => {
  it('renders the mocked request once it has loaded', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1001',
      path: '/requests/:id',
    })

    expect(await screen.findByText('ONC-2041 Phase II NSCLC Protocol v3.0')).toBeInTheDocument()
    // TODO: restore once login is implemented
    // expect(screen.getByText('Priya Nathan')).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown id', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-9999',
      path: '/requests/:id',
    })

    expect(await screen.findByText(/protocol document not found/i)).toBeInTheDocument()
  })

  it('links to the extraction results from the Schedule of Assessments card', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1001',
      path: '/requests/:id',
    })

    expect(
      await screen.findByText(/4 tables extracted/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view results/i })).toHaveAttribute(
      'href',
      '/requests/REQ-1001/soa',
    )
    expect(screen.getByRole('button', { name: /generate pop document/i })).toBeEnabled()
  }, 15000)

  it('enables Generate POP document only after the request is approved', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1008',
      path: '/requests/:id',
    })

    const pop = await screen.findByRole('button', { name: /generate pop document/i })
    expect(pop).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() => expect(pop).toBeEnabled())
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  }, 15000)

  it('does not offer Approve for a request that has not finished extraction', async () => {
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1002',
      path: '/requests/:id',
    })

    await screen.findByText(/CARD-7788/)
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('deletes the record after confirmation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ViewRequestPage />, {
      route: '/requests/REQ-1010',
      path: '/requests/:id',
    })

    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(await screen.findByText(/delete this protocol document?/i)).toBeInTheDocument()
    // Nothing is deleted until the dialog is confirmed.
    expect(requests.some((r) => r.id === 'REQ-1010')).toBe(true)

    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(requests.some((r) => r.id === 'REQ-1010')).toBe(false))
  })
})
