import type { Story } from '../types';

/**
 * Map a raw Firebase HN item into our normalized Story.
 * Raw shapes stay quarantined to the lib layer; everything downstream sees Story.
 * Derived values (HN discussion link, source domain) are computed at the view, not stored.
 */
export function fromFirebaseItem(item: any): Story {
  return {
    id: item.id,
    title: item.title ?? '',
    by: item.by ?? '',
    score: item.score ?? 0,
    time: item.time ?? 0,
    descendants: item.descendants ?? 0,
    type: item.type ?? 'story',
    url: item.url,
    text: item.text,
  };
}
