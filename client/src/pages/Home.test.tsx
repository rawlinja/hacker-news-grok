import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import Home from './Home'
import * as api from '../api'
import type { Story } from '../types'

afterEach(() => vi.restoreAllMocks())

const mk = (id: number): Story => ({
  id, title: `Story ${id}`, by: 'a', score: 1, time: 0, descendants: 0, type: 'story', url: 'https://x.com',
})

test('loads and lists the top feed on mount', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValue([mk(1), mk(2)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(await screen.findByText('Story 1')).toBeInTheDocument()
  expect(api.getFeed).toHaveBeenCalledWith('top', 0)
})

test('switching to Best refetches at page 0', async () => {
  const spy = vi.spyOn(api, 'getFeed').mockResolvedValue([mk(1)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  await screen.findByText('Story 1')
  await userEvent.click(screen.getByRole('tab', { name: /best/i }))
  await waitFor(() => expect(spy).toHaveBeenCalledWith('best', 0))
})

test('Load more appends the next page', async () => {
  vi.spyOn(api, 'getFeed')
    .mockResolvedValueOnce([mk(1)])
    .mockResolvedValueOnce([mk(2)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  await screen.findByText('Story 1')
  await userEvent.click(screen.getByRole('button', { name: /load more/i }))
  expect(await screen.findByText('Story 2')).toBeInTheDocument()
  expect(screen.getByText('Story 1')).toBeInTheDocument()
  expect(api.getFeed).toHaveBeenLastCalledWith('top', 1)
})

test('shows an error with retry when the feed fails', async () => {
  vi.spyOn(api, 'getFeed').mockRejectedValue(new Error('down'))
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(await screen.findByText(/couldn.t load/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
})
