import { describe, it, expect, vi } from 'vitest';
import { buildTagInput, parseTagResults, attachTags } from './tagging';
import type { Story } from '../../types';

const story = (over: Partial<Story>): Story => ({
  id: 1, title: 'T', by: 'a', score: 0, time: 0, descendants: 0, type: 'story', tags: [], ...over,
});

describe('buildTagInput', () => {
  it('projects id, title, url, type', () => {
    expect(buildTagInput([story({ id: 7, title: 'X', url: 'https://e.com', type: 'story' })]))
      .toEqual([{ id: 7, title: 'X', url: 'https://e.com', type: 'story' }]);
  });
});

describe('parseTagResults', () => {
  it('maps ids to vocab tags and drops unknown tags', () => {
    const json = JSON.stringify({ results: [
      { id: 1, tags: ['ai_ml', 'bogus'] },
      { id: 2, tags: [] },
    ] });
    const map = parseTagResults(json);
    expect(map.get(1)).toEqual(['ai_ml']);
    expect(map.get(2)).toEqual([]);
  });
});

describe('attachTags', () => {
  it('tags only uncached stories and fills tags from cache on repeat', async () => {
    const tagger = vi.fn(async (stories: Story[]) =>
      new Map(stories.map((s) => [s.id, ['ai_ml']])));

    const first = await attachTags([story({ id: 10 }), story({ id: 11 })], tagger);
    expect(first.map((s) => s.tags)).toEqual([['ai_ml'], ['ai_ml']]);
    expect(tagger).toHaveBeenCalledTimes(1);
    expect(tagger.mock.calls[0][0].map((s: Story) => s.id)).toEqual([10, 11]);

    const second = await attachTags([story({ id: 10 }), story({ id: 12 })], tagger);
    expect(second.map((s) => s.tags)).toEqual([['ai_ml'], ['ai_ml']]);
    expect(tagger).toHaveBeenCalledTimes(2);
    expect(tagger.mock.calls[1][0].map((s: Story) => s.id)).toEqual([12]);
  });
});
