import { describe, it, expect, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { buildTagInput, collectExcerpts, parseTagResults, attachTags } from './tagging.js';
import { applySchema } from '../../db/index.js';
import { createSqliteTagStore } from './tagStore.js';
import type { Story } from '../../types.js';

function memoryStore() {
  const db = new DatabaseSync(':memory:');
  applySchema(db);
  return createSqliteTagStore(db);
}

const story = (over: Partial<Story>): Story => ({
  id: 1,
  title: 'T',
  by: 'a',
  score: 0,
  time: 0,
  descendants: 0,
  type: 'story',
  tags: [],
  ...over,
});

describe('buildTagInput', () => {
  it('projects id, title, url, type, and excerpt', () => {
    const excerpts = new Map([[7, 'page text']]);
    expect(
      buildTagInput([story({ id: 7, title: 'X', url: 'https://e.com', type: 'story' })], excerpts),
    ).toEqual([{ id: 7, title: 'X', url: 'https://e.com', type: 'story', excerpt: 'page text' }]);
  });
});

describe('collectExcerpts', () => {
  it('uses the story text for text posts and the fetcher for linked stories', async () => {
    const fetchExcerpt = vi.fn(async (url?: string) => `fetched:${url}`);

    const excerpts = await collectExcerpts(
      [story({ id: 1, text: '<p>hello</p>' }), story({ id: 2, url: 'https://e.com' })],
      fetchExcerpt,
    );

    expect(excerpts.get(1)).toBe('hello');
    expect(excerpts.get(2)).toBe('fetched:https://e.com');
    expect(fetchExcerpt).toHaveBeenCalledTimes(1);
  });
});

describe('parseTagResults', () => {
  it('maps ids to vocab tags and drops unknown tags', () => {
    const json = JSON.stringify({
      results: [
        { id: 1, tags: ['ai_ml', 'bogus'] },
        { id: 2, tags: [] },
      ],
    });
    const map = parseTagResults(json);
    expect(map.get(1)).toEqual(['ai_ml']);
    expect(map.get(2)).toEqual([]);
  });
});

describe('attachTags', () => {
  it('tags only uncached stories and fills tags from cache on repeat', async () => {
    const store = memoryStore();
    const tagger = vi.fn(
      async (stories: Story[]) => new Map(stories.map((s) => [s.id, ['ai_ml']])),
    );

    const first = await attachTags([story({ id: 10 }), story({ id: 11 })], tagger, store);
    expect(first.map((s) => s.tags)).toEqual([['ai_ml'], ['ai_ml']]);
    expect(tagger).toHaveBeenCalledTimes(1);
    expect(tagger.mock.calls[0][0].map((s: Story) => s.id)).toEqual([10, 11]);

    const second = await attachTags([story({ id: 10 }), story({ id: 12 })], tagger, store);
    expect(second.map((s) => s.tags)).toEqual([['ai_ml'], ['ai_ml']]);
    expect(tagger).toHaveBeenCalledTimes(2);
    expect(tagger.mock.calls[1][0].map((s: Story) => s.id)).toEqual([12]);
  });

  it('does not persist stories a failed batch omitted', async () => {
    const store = memoryStore();
    const failing = vi.fn(async () => new Map<number, string[]>()); // API failure -> empty map

    const result = await attachTags([story({ id: 20 })], failing, store);
    expect(result[0].tags).toEqual([]); // response is still valid
    expect(store.getMany([20]).has(20)).toBe(false); // nothing persisted

    const retry = vi.fn(async (s: Story[]) => new Map(s.map((x) => [x.id, ['paper']])));
    const second = await attachTags([story({ id: 20 })], retry, store);
    expect(second[0].tags).toEqual(['paper']); // retried, not poisoned
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
