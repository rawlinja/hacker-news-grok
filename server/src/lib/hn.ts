import type { Feed, Story, Comment, StoryWithComments } from '../types';
import { toStory, type FirebaseItem } from './normalize';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export const PAGE_SIZE = 30;
const MAX_TOP_LEVEL_COMMENTS = 30;
const MAX_COMMENT_DEPTH = 3;

const FEED_ENDPOINT: Record<Feed, string> = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
};


export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&') 
    .trim();
}

interface CacheEntry {
  payload: unknown;
  expiresAt: number;
}
const responseCache = new Map<string, CacheEntry>();

async function fetchJsonCached<T>(url: string, ttlMs: number): Promise<T> {
  const cached = responseCache.get(url);
  
  if (cached && cached.expiresAt > Date.now()) { 
    return cached.payload as T;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HN fetch failed ${response.status}: ${url}`);
  
  const payload = (await response.json()) as T;

  responseCache.set(url, { payload, expiresAt: Date.now() + ttlMs });
  return payload;
}

export async function getFeedIds(feed: Feed): Promise<number[]> {
  const storyIds = await fetchJsonCached<number[] | null>(`${BASE_URL}/${FEED_ENDPOINT[feed]}.json`, 60_000);
  return Array.isArray(storyIds) ? storyIds : [];
}

export async function getItem(itemId: number): Promise<FirebaseItem | null> {
  return fetchJsonCached<FirebaseItem | null>(`${BASE_URL}/item/${itemId}.json`, 300_000);
}

export async function getStories(feed: Feed, page = 0, pageSize = PAGE_SIZE): Promise<Story[]> {
  const allStoryIds = await getFeedIds(feed);
  const pageStoryIds = allStoryIds.slice(page * pageSize, page * pageSize + pageSize);
  const rawItems = await Promise.all(pageStoryIds.map((storyId) => getItem(storyId)));
  
  return rawItems
    .filter((rawItem): rawItem is FirebaseItem => rawItem != null && !rawItem.deleted && !rawItem.dead)
    .map(toStory);
}

async function hydrateComments(
  commentIds: number[] | undefined,
  remainingDepth: number,
): Promise<Comment[]> {
  if (!commentIds || commentIds.length === 0 || remainingDepth <= 0) return [];

  const rawComments = await Promise.all(commentIds.map((commentId) => getItem(commentId)));

  const liveComments = rawComments.filter(
    (rawComment): rawComment is FirebaseItem =>
      rawComment != null && !rawComment.deleted && !rawComment.dead && rawComment.type === 'comment',
  );

  return Promise.all(
    liveComments.map(async (rawComment) => ({
      id: rawComment.id,
      by: rawComment.by ?? '',
      time: rawComment.time ?? 0,
      text: stripHtml(rawComment.text ?? ''),
      replies: await hydrateComments(rawComment.kids, remainingDepth - 1),
    })),
  );
}

export async function getStoryWithComments(
  storyId: number,
): Promise<StoryWithComments> {
  const rawStory = await getItem(storyId);
  if (!rawStory) throw new Error(`Story ${storyId} not found`);

  const story = toStory(rawStory);
  
  const topLevelCommentIds = Array.isArray(rawStory.kids)
    ? rawStory.kids.slice(0, MAX_TOP_LEVEL_COMMENTS)
    : [];
  
  const comments = await hydrateComments(topLevelCommentIds, MAX_COMMENT_DEPTH);
  return { story, comments };
}
