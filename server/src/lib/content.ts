import { stripHtml } from './hn';

const MAX_EXCERPT_CHARS = 1200;
const FETCH_TIMEOUT_MS = 5000;
const EXCERPT_TTL_MS = 86_400_000;

interface ExcerptCacheEntry {
  text: string;
  expiresAt: number;
}
const excerptCache = new Map<string, ExcerptCacheEntry>();

function firstMatch(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]).trim() : '';
}

export function extractReadableText(html: string): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const title = firstMatch(withoutNoise, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    firstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);

  const body = stripHtml(withoutNoise).replace(/\s+/g, ' ').trim();

  return [title, description, body].filter(Boolean).join('\n').slice(0, MAX_EXCERPT_CHARS);
}

export async function fetchUrlExcerpt(url?: string): Promise<string> {
  if (!url) return '';

  const cached = excerptCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.text;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'hn-grok-tagger/1.0' },
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !contentType.includes('text/html')) {
      excerptCache.set(url, { text: '', expiresAt: Date.now() + EXCERPT_TTL_MS });
      return '';
    }

    const text = extractReadableText(await response.text());
    excerptCache.set(url, { text, expiresAt: Date.now() + EXCERPT_TTL_MS });
    return text;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}
