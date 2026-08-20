import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler } from './errors.js';
import { FeedQuerySchema } from './validate.js';

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as Response & typeof res;
}

function feedQueryError() {
  return FeedQuerySchema.safeParse({ feed: 'garbage' }).error;
}

describe('errorHandler', () => {
  it('turns a ZodError into a 400 listing the offending fields', () => {
    const res = mockResponse();

    errorHandler(feedQueryError(), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ field: 'feed', message: expect.any(String) }],
    });
  });

  it('turns any other error into a 500 carrying its message', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockResponse();

    errorHandler(new Error('boom'), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
    expect(logged).toHaveBeenCalled();

    logged.mockRestore();
  });

  it('falls back to a generic message for a non-Error throw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockResponse();

    errorHandler('kaboom', {} as Request, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ error: 'Internal error' });
  });
});
