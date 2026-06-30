import { expect, test } from 'vitest'
import { deriveTagFacets, filterByTags } from './tags'
import type { Story } from '../types'

const story = (id: number, tags: string[]): Story => ({
  id, title: `S${id}`, by: 'a', score: 0, time: 0, descendants: 0, type: 'story', tags,
})

test('deriveTagFacets counts present vocab tags, ordered by count then vocab, ignoring unknown', () => {
  const facets = deriveTagFacets([
    story(1, ['ai_ml', 'paper']),
    story(2, ['ai_ml']),
    story(3, ['bogus']),
  ])
  expect(facets).toEqual([
    { tag: 'ai_ml', label: 'AI/ML', count: 2 },
    { tag: 'paper', label: 'Paper', count: 1 },
  ])
})

test('filterByTags returns the OR/union of selected tags', () => {
  const list = [story(1, ['ai_ml']), story(2, ['paper']), story(3, ['science_research'])]
  expect(filterByTags(list, ['ai_ml', 'paper']).map((s) => s.id)).toEqual([1, 2])
})

test('filterByTags with no selection returns all and does not mutate', () => {
  const list = [story(1, ['ai_ml']), story(2, [])]
  expect(filterByTags(list, []).map((s) => s.id)).toEqual([1, 2])
  expect(list.map((s) => s.id)).toEqual([1, 2])
})
