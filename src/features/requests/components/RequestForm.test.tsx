import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { RequestForm } from '@/features/requests/components/RequestForm'

describe('RequestForm', () => {
  it('shows validation errors when required fields are missing', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<RequestForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText(/title must be at least 5 characters/i)).toBeInTheDocument()
    // TODO: restore once login is implemented
    // expect(screen.getByText(/requested by is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
