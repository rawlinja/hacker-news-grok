import { describe, it, expect } from 'vitest';
import { toExcerpt } from './content';

describe('toExcerpt', () => {
  it('combines title, description, and stripped content', () => {
    const text = toExcerpt({
      title: 'Postgres Internals',
      description: 'How MVCC works under the hood',
      content: '<p>Transactions give you atomicity.</p>',
    });

    expect(text).toContain('Postgres Internals');
    expect(text).toContain('How MVCC works under the hood');
    expect(text).toContain('Transactions give you atomicity.');
  });

  it('returns an empty string when extraction failed', () => {
    expect(toExcerpt(null)).toBe('');
  });

  it('truncates to the character budget', () => {
    const text = toExcerpt({ content: `<p>${'a'.repeat(5000)}</p>` });
    expect(text.length).toBeLessThanOrEqual(1200);
  });
});
