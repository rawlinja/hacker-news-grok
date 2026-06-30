import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StoryCard from './StoryCard'
import type { Story } from '../types'

const story: Story = {
  id: 7, title: 'A neat thing', by: 'pg', score: 123,
  time: Math.floor(Date.now() / 1000) - 3600, descendants: 45, type: 'story',
  url: 'https://www.example.com/post',
}

function renderCard(s: Story) {
  return render(<MemoryRouter><StoryCard story={s} /></MemoryRouter>)
}

test('renders title linking to the external url', () => {
  renderCard(story)
  expect(screen.getByRole('link', { name: 'A neat thing' })).toHaveAttribute('href', 'https://www.example.com/post')
})

test('shows domain, author, score, and comment count', () => {
  renderCard(story)
  expect(screen.getByText(/example\.com/)).toBeInTheDocument()
  expect(screen.getByText(/pg/)).toBeInTheDocument()
  expect(screen.getByText(/123/)).toBeInTheDocument()
  expect(screen.getByText(/45/)).toBeInTheDocument()
})

test('links the comment count to the detail route', () => {
  renderCard(story)
  expect(screen.getByRole('link', { name: /45 comments/i })).toHaveAttribute('href', '/story/7')
})

test('text post without url titles link to the detail route', () => {
  renderCard({ ...story, url: undefined })
  expect(screen.getByRole('link', { name: 'A neat thing' })).toHaveAttribute('href', '/story/7')
})
