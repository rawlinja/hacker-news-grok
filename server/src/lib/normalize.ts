import type { Story } from '../types';

export interface FirebaseItem {
  id: number;
  type?: string;
  title?: string;
  by?: string;
  score?: number;
  time?: number;
  descendants?: number;
  url?: string;
  text?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
}

export function toStory(item: FirebaseItem): Story {
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
