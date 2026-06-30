import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import Home from './Home'
import * as api from '../api'
import { useFeedStore } from '../store/feedStore'
import type { Story } from '../types'

const makeStory = (id: number, tags: string[] = []): Story => ({
  id, title: `Story ${id}`, by: 'a', score: 1, time: 0, descendants: 0, type: 'story', url: 'https://x.com', tags,
})

beforeEach(() => {
  sessionStorage.clear()
  useFeedStore.setState({
    feed: 'top', page: 0, loadedStories: [], loading: false, error: false, selectedTags: [],
  })
})
afterEach(() => vi.restoreAllMocks())

test('loads and lists the top feed on mount', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(1), makeStory(2)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(await screen.findByText('Story 1')).toBeInTheDocument()
  expect(api.getFeed).toHaveBeenCalledWith('top', 0)
})

test('switching to Best refetches at page 0', async () => {
  const getFeedSpy = vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(1)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  await screen.findByText('Story 1')
  await userEvent.click(screen.getByRole('tab', { name: /best/i }))
  await waitFor(() => expect(getFeedSpy).toHaveBeenCalledWith('best', 0))
})

test('Load more appends the next page', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValueOnce([makeStory(1)]).mockResolvedValueOnce([makeStory(2)])
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

test('filters the list to stories with the selected tag', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(1, ['ai_ml']), makeStory(2, ['paper'])])
  render(<MemoryRouter><Home /></MemoryRouter>)
  await screen.findByText('Story 1')
  await userEvent.click(screen.getByRole('button', { name: /AI\/ML/ }))
  expect(screen.getByText('Story 1')).toBeInTheDocument()
  await waitFor(() => expect(screen.queryByText('Story 2')).not.toBeInTheDocument())
})

test('reuses a rehydrated pool without refetching', async () => {
  useFeedStore.setState({ loadedStories: [makeStory(7)], page: 0, feed: 'top' })
  const getFeedSpy = vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(99)])
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(await screen.findByText('Story 7')).toBeInTheDocument()
  expect(getFeedSpy).not.toHaveBeenCalled()
})
