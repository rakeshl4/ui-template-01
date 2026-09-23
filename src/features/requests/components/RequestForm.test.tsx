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

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    expect(await screen.findByText(/title must be at least 5 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/requested by is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables the action buttons while a submission is pending', async () => {
    let resolveSubmit!: () => void
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    const user = userEvent.setup()
    renderWithProviders(<RequestForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/^title/i), 'Laptop replacement request')
    await user.type(
      screen.getByLabelText(/^description/i),
      'This description is definitely long enough to pass validation.',
    )
    await user.type(screen.getByLabelText(/requested by/i), 'Jamie Rivera')

    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

    resolveSubmit()
  })
})
