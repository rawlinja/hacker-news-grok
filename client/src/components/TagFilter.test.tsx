import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test } from 'vitest'
import TagFilter from './TagFilter'
import { useFeedStore } from '../store/feedStore'

const facets = [
  { tag: 'ai_ml' as const, label: 'AI/ML', count: 8 },
  { tag: 'security_privacy' as const, label: 'Security/Privacy', count: 5 },
  { tag: 'paper' as const, label: 'Paper', count: 3 },
]

beforeEach(() => useFeedStore.setState({ selectedTags: [] }))
afterEach(() => {
  document.body.style.overflow = ''
})

test('renders nothing when there are no facets', () => {
  const { container } = render(<TagFilter facets={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('trigger shows the active tag count and an inline Clear only when tags are active', async () => {
  useFeedStore.setState({ selectedTags: ['ai_ml'] })
  render(<TagFilter facets={facets} />)
  expect(screen.getByRole('button', { name: 'Filter (1)' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /clear/i }))
  expect(useFeedStore.getState().selectedTags).toEqual([])
  expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
})

test('opens the sheet from the trigger and closes it with the X and Escape', async () => {
  render(<TagFilter facets={facets} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
  expect(screen.getByRole('dialog', { name: 'Filter by tag' })).toBeInTheDocument()
  expect(document.body.style.overflow).toBe('hidden')

  await userEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')

  await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('tapping a row toggles the tag live and reflects checked state', async () => {
  render(<TagFilter facets={facets} />)
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }))

  const aiRow = screen.getByRole('checkbox', { name: /AI\/ML/ })
  expect(aiRow).not.toBeChecked()
  await userEvent.click(aiRow)
  expect(useFeedStore.getState().selectedTags).toEqual(['ai_ml'])
  expect(screen.getByRole('checkbox', { name: /AI\/ML/ })).toBeChecked()

  await userEvent.click(screen.getByRole('checkbox', { name: /AI\/ML/ }))
  expect(useFeedStore.getState().selectedTags).toEqual([])
})

test('Clear all empties selected tags without closing the sheet', async () => {
  useFeedStore.setState({ selectedTags: ['ai_ml', 'paper'] })
  render(<TagFilter facets={facets} />)
  await userEvent.click(screen.getByRole('button', { name: 'Filter (2)' }))

  await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
  expect(useFeedStore.getState().selectedTags).toEqual([])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('search narrows the visible rows by label and restores when cleared', async () => {
  render(<TagFilter facets={facets} />)
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }))

  const search = screen.getByPlaceholderText(/filter/i)
  await userEvent.type(search, 'sec')
  expect(screen.getByRole('checkbox', { name: /Security\/Privacy/ })).toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: /AI\/ML/ })).not.toBeInTheDocument()

  await userEvent.clear(search)
  expect(screen.getByRole('checkbox', { name: /AI\/ML/ })).toBeInTheDocument()
})
