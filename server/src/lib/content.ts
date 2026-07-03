import { extract } from '@extractus/article-extractor';
import { stripHtml } from './hn.js';

const MAX_EXCERPT_CHARS = 1200;
const FETCH_TIMEOUT_MS = 5000;
const EXCERPT_TTL_MS = 86_400_000;

interface ExcerptCacheEntry {
  text: string;
  expiresAt: number;
}
const excerptCache = new Map<string, ExcerptCacheEntry>();

interface Article {
  title?: string;
  description?: string;
  content?: string;
}

export function toExcerpt(article: Article | null): string {
  if (!article) return '';

  return [article.title, article.description, article.content && stripHtml(article.content)]
    .filter(Boolean)
    .map((part) => (part as string).replace(/\s+/g, ' ').trim())
    .join('\n')
    .slice(0, MAX_EXCERPT_CHARS);
}

export async function fetchUrlExcerpt(url?: string): Promise<string> {
  if (!url) return '';

  const cached = excerptCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.text;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const article = (await extract(url, {}, { signal: controller.signal })) as Article | null;
    const text = toExcerpt(article);
    excerptCache.set(url, { text, expiresAt: Date.now() + EXCERPT_TTL_MS });
    return text;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}
