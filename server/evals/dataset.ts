import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Story } from '../src/types';
import type { Case } from './schema';

export const DATASET_PATH = fileURLToPath(new URL('./dataset/tags.json', import.meta.url));

export function loadCases(): Case[] {
  return JSON.parse(readFileSync(DATASET_PATH, 'utf8')) as Case[];
}

export function caseToStory(testCase: Case): Story {
  return {
    id: testCase.id,
    title: testCase.title,
    url: testCase.url,
    type: testCase.type,
    by: '',
    score: 0,
    time: 0,
    descendants: 0,
    tags: [],
  };
}
