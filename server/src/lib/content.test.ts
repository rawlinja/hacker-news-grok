import { describe, it, expect } from 'vitest';
import { extractReadableText } from './content';

describe('extractReadableText', () => {
  it('pulls the title, meta description, and body while dropping scripts and styles', () => {
    const html = `
      <html>
        <head>
          <title>Postgres Internals</title>
          <meta name="description" content="How MVCC works under the hood" />
          <style>.x { color: red }</style>
          <script>console.log('tracking')</script>
        </head>
        <body><p>Transactions give you atomicity.</p></body>
      </html>`;

    const text = extractReadableText(html);

    expect(text).toContain('Postgres Internals');
    expect(text).toContain('How MVCC works under the hood');
    expect(text).toContain('Transactions give you atomicity.');
    expect(text).not.toContain('tracking');
    expect(text).not.toContain('color: red');
  });

  it('falls back to og:description when no meta description is present', () => {
    const html = `<head><meta property="og:description" content="A social description" /></head><body>Body.</body>`;
    expect(extractReadableText(html)).toContain('A social description');
  });

  it('truncates to the character budget', () => {
    const html = `<body>${'a'.repeat(5000)}</body>`;
    expect(extractReadableText(html).length).toBeLessThanOrEqual(1200);
  });
});
