import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../lib/hn.js', () => ({
  getStories: vi.fn(async () => []),
  getStoryWithComments: vi.fn(async () => ({ story: null, comments: [] })),
}));

vi.mock('../lib/llm/tagging.js', () => ({
  attachTags: vi.fn(async (stories: unknown[]) => stories),
}));

const { getStories, getStoryWithComments } = await import('../lib/hn.js');
const { default: app } = await import('../app.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/feed', () => {
  it('rejects an unknown feed', async () => {
    const response = await request(app).get('/api/feed?feed=garbage');

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('feed');
  });

  it('rejects a page that is not a whole number at or above zero', async () => {
    for (const page of ['abc', '-1', '1.5']) {
      const response = await request(app).get(`/api/feed?page=${page}`);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe('page');
    }
  });

  it('defaults an empty query to the top feed, page 0', async () => {
    await request(app).get('/api/feed');

    expect(getStories).toHaveBeenCalledWith('top', 0);
  });

  it('passes the page through as a number', async () => {
    await request(app).get('/api/feed?feed=best&page=2');

    expect(getStories).toHaveBeenCalledWith('best', 2);
  });
});

describe('GET /api/story/:id and /api/summary/:id', () => {
  it('rejects ids that are not positive whole numbers', async () => {
    for (const path of ['/api/story/abc', '/api/story/0', '/api/summary/abc']) {
      const response = await request(app).get(path);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe('id');
    }
  });

  it('passes the story id through as a number', async () => {
    await request(app).get('/api/story/123');

    expect(getStoryWithComments).toHaveBeenCalledWith(123);
  });
});
