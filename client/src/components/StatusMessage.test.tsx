import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StatusMessage from './StatusMessage'

test('renders message and fires retry', async () => {
  const onRetry = vi.fn()
  render(<StatusMessage onRetry={onRetry}>Something broke</StatusMessage>)
  expect(screen.getByText('Something broke')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /retry/i }))
  expect(onRetry).toHaveBeenCalledOnce()
})
