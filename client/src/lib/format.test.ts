import { expect, test } from 'vitest'
import { domainOf, hnDiscussUrl, relativeAge } from './format'

const NOW = 1_700_000_000 // fixed reference, seconds

test('relativeAge formats common spans', () => {
  expect(relativeAge(NOW, NOW)).toBe('just now')
  expect(relativeAge(NOW - 90, NOW)).toBe('1 minute ago')
  expect(relativeAge(NOW - 3 * 3600, NOW)).toBe('3 hours ago')
  expect(relativeAge(NOW - 2 * 86400, NOW)).toBe('2 days ago')
})

test('domainOf strips protocol and www', () => {
  expect(domainOf('https://www.example.com/path?q=1')).toBe('example.com')
  expect(domainOf('http://sub.example.org')).toBe('sub.example.org')
  expect(domainOf(undefined)).toBe('')
  expect(domainOf('not a url')).toBe('')
})

test('hnDiscussUrl builds the item link', () => {
  expect(hnDiscussUrl(42)).toBe('https://news.ycombinator.com/item?id=42')
})
