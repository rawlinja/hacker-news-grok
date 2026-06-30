import type { Feed, Story, Comment } from '../types';
import { fromFirebaseItem } from './normalize';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
export const PAGE_SIZE = 15;
const MAX_TOP_LEVEL_COMMENTS = 30;
const MAX_COMMENT_DEPTH = 2;

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

export function boundComments(
  roots: Comment[],
  maxTopLevel = MAX_TOP_LEVEL_COMMENTS,
  maxDepth = MAX_COMMENT_DEPTH,
): Comment[] {
  const limitDepth = (comments: Comment[], remainingDepth: number): Comment[] =>
    comments.map((comment) => ({
      ...comment,
      replies: remainingDepth > 1 ? limitDepth(comment.replies, remainingDepth - 1) : [],
    }));
  return limitDepth(roots.slice(0, maxTopLevel), maxDepth);
}

interface CacheEntry {
  payload: any;
  expiresAt: number;
}
const responseCache = new Map<string, CacheEntry>();

async function fetchJsonCached(url: string, ttlMs: number): Promise<any> {
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HN fetch failed ${response.status}: ${url}`);
  const payload = await response.json();

  responseCache.set(url, { payload, expiresAt: Date.now() + ttlMs });
  return payload;
}

export async function getFeedIds(feed: Feed): Promise<number[]> {
  const storyIds = await fetchJsonCached(`${BASE_URL}/${FEED_ENDPOINT[feed]}.json`, 60_000);
  return Array.isArray(storyIds) ? storyIds : [];
}

export async function getItem(itemId: number): Promise<any> {
  return fetchJsonCached(`${BASE_URL}/item/${itemId}.json`, 300_000);
}

export async function getStories(feed: Feed, page = 0, pageSize = PAGE_SIZE): Promise<Story[]> {
  const allStoryIds = await getFeedIds(feed);
  const pageStoryIds = allStoryIds.slice(page * pageSize, page * pageSize + pageSize);
  const rawItems = await Promise.all(pageStoryIds.map((storyId) => getItem(storyId)));
  return rawItems
    .filter((rawItem) => rawItem && !rawItem.deleted && !rawItem.dead)
    .map(fromFirebaseItem);
}

async function hydrateComments(
  commentIds: number[] | undefined,
  remainingDepth: number,
): Promise<Comment[]> {
  if (!commentIds || commentIds.length === 0 || remainingDepth <= 0) return [];

  const rawComments = await Promise.all(commentIds.map((commentId) => getItem(commentId)));
  const comments: Comment[] = [];

  for (const rawComment of rawComments) {
    if (!rawComment || rawComment.deleted || rawComment.dead || rawComment.type !== 'comment') continue;
    comments.push({
      id: rawComment.id,
      by: rawComment.by ?? '',
      time: rawComment.time ?? 0,
      text: stripHtml(rawComment.text ?? ''),
      replies: await hydrateComments(rawComment.kids, remainingDepth - 1),
    });
  }
  return comments;
}

export async function getStoryWithComments(
  storyId: number,
): Promise<{ story: Story; comments: Comment[] }> {
  const rawStory = await getItem(storyId);
  if (!rawStory) throw new Error(`Story ${storyId} not found`);

  const story = fromFirebaseItem(rawStory);
  const topLevelCommentIds = Array.isArray(rawStory.kids)
    ? rawStory.kids.slice(0, MAX_TOP_LEVEL_COMMENTS)
    : [];
  const comments = await hydrateComments(topLevelCommentIds, MAX_COMMENT_DEPTH);
  return { story, comments };
}
