import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'

test('renders the header with a home link and the outlet', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<App />}>
          <Route index element={<div>home content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /hn grok/i })).toHaveAttribute('href', '/')
  expect(screen.getByText('home content')).toBeInTheDocument()
})
