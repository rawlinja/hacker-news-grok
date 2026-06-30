import { describe, it, expect } from 'vitest';
import { stripHtml, boundComments } from './hn';
import type { Comment } from '../types';

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    expect(stripHtml('<p>a &amp; b<br>c &gt; d</p>')).toBe('a & b\nc > d');
  });
  it('decodes quotes and apostrophes', () => {
    expect(stripHtml('he said &quot;hi&quot; &#x27;ok&#x27;')).toBe('he said "hi" \'ok\'');
  });
});

describe('boundComments', () => {
  const mk = (id: number, replies: Comment[] = []): Comment => ({
    id, by: 'x', time: 0, text: '', replies,
  });
  it('caps top-level count and depth', () => {
    const roots = Array.from({ length: 40 }, (_, i) =>
      mk(i, [mk(100 + i, [mk(200 + i)])]),
    );
    const out = boundComments(roots, 30, 2);
    expect(out).toHaveLength(30);
    // depth 2 keeps roots + their direct replies, drops grandchildren
    expect(out[0].replies).toHaveLength(1);
    expect(out[0].replies[0].replies).toHaveLength(0);
  });
});
