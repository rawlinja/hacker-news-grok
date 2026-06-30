import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import Summary from './Summary'
import * as api from '../api'

afterEach(() => vi.restoreAllMocks())

test('does not fetch on mount; fetches on click', async () => {
  const spy = vi.spyOn(api, 'getSummary').mockResolvedValue({ summary: 'TL;DR here', commentsUsed: 12 })
  render(<Summary storyId={5} />)
  expect(spy).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /summarize/i }))
  expect(await screen.findByText('TL;DR here')).toBeInTheDocument()
  expect(screen.getByText(/12 comments/i)).toBeInTheDocument()
  expect(spy).toHaveBeenCalledWith(5)
})

test('shows an error and allows retry', async () => {
  vi.spyOn(api, 'getSummary').mockRejectedValue(new Error('nope'))
  render(<Summary storyId={5} />)
  await userEvent.click(screen.getByRole('button', { name: /summarize/i }))
  expect(await screen.findByText(/couldn.t generate/i)).toBeInTheDocument()
})
