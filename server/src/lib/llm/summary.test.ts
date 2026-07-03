import { describe, it, expect } from 'vitest';
import { buildTranscript } from './summary.js';
import type { Comment } from '../../types.js';

const comment = (id: number, by: string, text: string, replies: Comment[] = []): Comment => ({
  id,
  by,
  time: 0,
  text,
  replies,
});

describe('buildTranscript', () => {
  it('flattens nested comments with authors and indentation', () => {
    const { transcript } = buildTranscript([comment(1, 'alice', 'hi', [comment(2, 'bob', 'yo')])]);
    expect(transcript).toContain('alice: hi');
    expect(transcript).toContain('  bob: yo');
  });

  it('counts the comments included in the transcript', () => {
    const { commentsUsed } = buildTranscript([
      comment(1, 'alice', 'hi', [comment(2, 'bob', 'yo')]),
    ]);
    expect(commentsUsed).toBe(2);
  });

  it('returns an empty transcript and zero count for no comments', () => {
    expect(buildTranscript([])).toEqual({ transcript: '', commentsUsed: 0 });
  });
});
