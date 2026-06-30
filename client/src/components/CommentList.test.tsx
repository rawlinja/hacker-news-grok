import { render, screen } from '@testing-library/react'
import CommentList from './CommentList'
import type { Comment } from '../types'

const comments: Comment[] = [
  { id: 1, by: 'alice', time: 0, text: 'top level', replies: [
    { id: 2, by: 'bob', time: 0, text: 'a reply', replies: [] },
  ] },
]

test('renders nested comments with authors', () => {
  render(<CommentList comments={comments} />)
  expect(screen.getByText('top level')).toBeInTheDocument()
  expect(screen.getByText('a reply')).toBeInTheDocument()
  expect(screen.getByText('alice')).toBeInTheDocument()
  expect(screen.getByText('bob')).toBeInTheDocument()
})
