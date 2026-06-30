import type { Feed, Story, StoryDetail, StorySummary } from './types'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${path}`)
  return response.json() as Promise<T>
}

export function getFeed(feed: Feed, page: number): Promise<Story[]> {
  return getJson<Story[]>(`/api/feed?feed=${feed}&page=${page}`)
}

export function getStory(id: number): Promise<StoryDetail> {
  return getJson<StoryDetail>(`/api/story/${id}`)
}

export function getSummary(id: number): Promise<StorySummary> {
  return getJson<StorySummary>(`/api/summary/${id}`)
}
