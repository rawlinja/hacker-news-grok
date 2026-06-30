import { afterEach, expect, test, vi } from 'vitest'
import { getFeed, getStory, getSummary } from './api'

afterEach(() => vi.restoreAllMocks())

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response)
}

test('getFeed requests the feed+page and returns stories', async () => {
  const fetchSpy = mockFetch([{ id: 1, title: 'A' }])
  const stories = await getFeed('best', 2)
  expect(fetchSpy).toHaveBeenCalledWith('/api/feed?feed=best&page=2')
  expect(stories).toEqual([{ id: 1, title: 'A' }])
})

test('getStory requests the story detail', async () => {
  const fetchSpy = mockFetch({ story: { id: 9 }, comments: [] })
  const detail = await getStory(9)
  expect(fetchSpy).toHaveBeenCalledWith('/api/story/9')
  expect(detail.story.id).toBe(9)
})

test('getSummary requests the summary', async () => {
  const fetchSpy = mockFetch({ summary: 'hi', commentsUsed: 3 })
  const result = await getSummary(9)
  expect(fetchSpy).toHaveBeenCalledWith('/api/summary/9')
  expect(result.commentsUsed).toBe(3)
})

test('throws on a non-OK response', async () => {
  mockFetch({ error: 'boom' }, false, 500)
  await expect(getFeed('top', 0)).rejects.toThrow()
})
