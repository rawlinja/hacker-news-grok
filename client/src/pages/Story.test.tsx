import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import Story from './Story'
import * as api from '../api'
import type { StoryDetail } from '../types'

afterEach(() => vi.restoreAllMocks())

const detail: StoryDetail = {
  story: {
    id: 3,
    title: 'Deep dive',
    by: 'pg',
    score: 200,
    time: 0,
    descendants: 2,
    type: 'story',
    url: 'https://www.example.com/x',
  },
  comments: [{ id: 9, by: 'ann', time: 0, text: 'first', replies: [] }],
}

function renderAt(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/story/${id}`]}>
      <Routes>
        <Route path="story/:id" element={<Story />} />
      </Routes>
    </MemoryRouter>,
  )
}

test('loads the story, links, and comments', async () => {
  vi.spyOn(api, 'getStory').mockResolvedValue(detail)
  renderAt(3)
  expect(await screen.findByText('Deep dive')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /read article/i })).toHaveAttribute(
    'href',
    'https://www.example.com/x',
  )
  expect(screen.getByRole('link', { name: /discuss on hn/i })).toHaveAttribute(
    'href',
    'https://news.ycombinator.com/item?id=3',
  )
  expect(screen.getByText('first')).toBeInTheDocument()
})

test('does not auto-load the summary (button present, no summary text)', async () => {
  const summarySpy = vi.spyOn(api, 'getSummary')
  vi.spyOn(api, 'getStory').mockResolvedValue(detail)
  renderAt(3)
  await screen.findByText('Deep dive')
  expect(screen.getByRole('button', { name: /summarize/i })).toBeInTheDocument()
  expect(summarySpy).not.toHaveBeenCalled()
})

test('shows an error with retry on failure', async () => {
  vi.spyOn(api, 'getStory').mockRejectedValue(new Error('boom'))
  renderAt(3)
  expect(await screen.findByText(/couldn.t load this story/i)).toBeInTheDocument()
})
