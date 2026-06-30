import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useFeedStore } from './feedStore'
import * as api from '../api'
import type { Story } from '../types'

const makeStory = (id: number, tags: string[] = []): Story => ({
  id, title: `S${id}`, by: 'a', score: 0, time: 0, descendants: 0, type: 'story', tags,
})

beforeEach(() => {
  sessionStorage.clear()
  useFeedStore.setState({
    feed: 'top', page: 0, loadedStories: [], loading: false, error: false, selectedTags: [],
  })
})
afterEach(() => vi.restoreAllMocks())

test('ensureLoaded fetches page 0 once then no-ops', async () => {
  const getFeedSpy = vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(1)])
  await useFeedStore.getState().ensureLoaded()
  await useFeedStore.getState().ensureLoaded()
  expect(getFeedSpy).toHaveBeenCalledTimes(1)
  expect(useFeedStore.getState().loadedStories.map((story) => story.id)).toEqual([1])
})

test('loadMore appends the next page and bumps page', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValueOnce([makeStory(1)]).mockResolvedValueOnce([makeStory(2)])
  await useFeedStore.getState().ensureLoaded()
  await useFeedStore.getState().loadMore()
  expect(useFeedStore.getState().loadedStories.map((story) => story.id)).toEqual([1, 2])
  expect(useFeedStore.getState().page).toBe(1)
})

test('toggleTag adds then removes; clearTags empties', () => {
  useFeedStore.getState().toggleTag('ai_ml')
  expect(useFeedStore.getState().selectedTags).toEqual(['ai_ml'])
  useFeedStore.getState().toggleTag('ai_ml')
  expect(useFeedStore.getState().selectedTags).toEqual([])
  useFeedStore.getState().toggleTag('paper')
  useFeedStore.getState().clearTags()
  expect(useFeedStore.getState().selectedTags).toEqual([])
})

test('persists pool and selection to sessionStorage', async () => {
  vi.spyOn(api, 'getFeed').mockResolvedValue([makeStory(1)])
  await useFeedStore.getState().ensureLoaded()
  useFeedStore.getState().toggleTag('ai_ml')
  const saved = JSON.parse(sessionStorage.getItem('hn-grok-feed') ?? '{}')
  expect(saved.state.loadedStories.map((story: Story) => story.id)).toEqual([1])
  expect(saved.state.selectedTags).toEqual(['ai_ml'])
})
