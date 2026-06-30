import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import TagFilter from './TagFilter'
import { useFeedStore } from '../store/feedStore'

const facets = [
  { tag: 'ai_ml' as const, label: 'AI/ML', count: 8 },
  { tag: 'paper' as const, label: 'Paper', count: 5 },
]

beforeEach(() => useFeedStore.setState({ selectedTags: [] }))

test('tapping a chip toggles the tag in the store', async () => {
  render(<TagFilter facets={facets} />)
  const aiChip = screen.getByRole('button', { name: /AI\/ML/ })
  await userEvent.click(aiChip)
  expect(useFeedStore.getState().selectedTags).toEqual(['ai_ml'])
  await userEvent.click(aiChip)
  expect(useFeedStore.getState().selectedTags).toEqual([])
})

test('shows the count and a Clear control once a tag is active', async () => {
  render(<TagFilter facets={facets} />)
  expect(screen.getByRole('button', { name: /AI\/ML 8/ })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /AI\/ML/ }))
  await userEvent.click(screen.getByRole('button', { name: /clear/i }))
  expect(useFeedStore.getState().selectedTags).toEqual([])
})
