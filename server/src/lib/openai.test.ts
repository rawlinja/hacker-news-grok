import { describe, it, expect } from 'vitest';
import { buildTranscript } from './openai';
import type { Comment } from '../types';

const comment = (id: number, by: string, text: string, replies: Comment[] = []): Comment => ({
  id,
  by,
  time: 0,
  text,
  replies,
});

describe('buildTranscript', () => {
  it('flattens nested comments with authors and indentation', () => {
    const transcript = buildTranscript([
      comment(1, 'alice', 'hi', [comment(2, 'bob', 'yo')]),
    ]);
    expect(transcript).toContain('alice: hi');
    expect(transcript).toContain('  bob: yo');
  });

  it('returns an empty string for no comments', () => {
    expect(buildTranscript([])).toBe('');
  });
});
