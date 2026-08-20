import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { FeedQuerySchema, StoryIdParamsSchema } from './validate.js';

describe('FeedQuerySchema', () => {
  it('defaults an empty query to the top feed, page 0', () => {
    expect(FeedQuerySchema.parse({})).toEqual({ feed: 'top', page: 0 });
  });

  it('coerces page to a number', () => {
    expect(FeedQuerySchema.parse({ feed: 'best', page: '2' })).toEqual({ feed: 'best', page: 2 });
  });

  it('rejects an unknown feed', () => {
    expect(() => FeedQuerySchema.parse({ feed: 'garbage' })).toThrow(ZodError);
  });

  it('rejects a page that is not a whole number at or above zero', () => {
    for (const page of ['abc', '-1', '1.5']) {
      expect(() => FeedQuerySchema.parse({ page })).toThrow(ZodError);
    }
  });

  it('reports the offending field on the issue path', () => {
    const result = FeedQuerySchema.safeParse({ feed: 'garbage' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['feed']);
  });
});

describe('StoryIdParamsSchema', () => {
  it('coerces a numeric id', () => {
    expect(StoryIdParamsSchema.parse({ id: '123' })).toEqual({ id: 123 });
  });

  it('rejects ids that are not positive whole numbers', () => {
    for (const id of ['abc', '1.5', '0', '-3']) {
      expect(() => StoryIdParamsSchema.parse({ id })).toThrow(ZodError);
    }
  });
});
