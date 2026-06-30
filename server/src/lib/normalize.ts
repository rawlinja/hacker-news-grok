import type { Story } from '../types';

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
    tags: [],
  };
}
