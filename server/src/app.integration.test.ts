import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('Browse top/new/best stories', () => {
  it('returns stories for each feed', async () => {
    for (const feed of ['top', 'new', 'best']) {
      const response = await request(app).get(`/api/feed?feed=${feed}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    }
  });
});

describe('Select a story and view its details', () => {
  it('returns the story with its comments', async () => {
    const feed = await request(app).get('/api/feed?feed=top');
    const response = await request(app).get(`/api/story/${feed.body[0].id}`);
    expect(response.status).toBe(200);
    expect(response.body.story.title).toBeTruthy();
    expect(Array.isArray(response.body.comments)).toBe(true);
  });
});

describe('AI summary of the discussion', () => {
  it('returns a generated summary for a story with comments', async () => {
    const feed = await request(app).get('/api/feed?feed=best');
    const story = feed.body.find((candidate: { descendants: number }) => candidate.descendants > 0);
    const response = await request(app).get(`/api/summary/${story.id}`);
    expect(response.status).toBe(200);
    expect(response.body.commentsUsed).toBeGreaterThan(0);
    expect(response.body.summary).not.toBe('Summary unavailable.');
  });
});
