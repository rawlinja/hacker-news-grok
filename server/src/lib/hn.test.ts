import { describe, it, expect } from 'vitest';
import { stripHtml } from './hn.js';

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    expect(stripHtml('<p>a &amp; b<br>c &gt; d</p>')).toBe('a & b\nc > d');
  });
  it('decodes quotes and apostrophes', () => {
    expect(stripHtml('he said &quot;hi&quot; &#x27;ok&#x27;')).toBe('he said "hi" \'ok\'');
  });
});
