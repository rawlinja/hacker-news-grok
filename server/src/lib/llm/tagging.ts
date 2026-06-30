import type { Story } from '../../types';
import { getClient } from './client';
import { TAG_VOCAB, TAGGING_PROMPT } from './prompts';

const VOCAB = new Set<string>(TAG_VOCAB);

export function buildTagInput(stories: Story[]) {
  return stories.map((s) => ({ id: s.id, title: s.title, url: s.url, type: s.type }));
}

export function parseTagResults(rawJson: string): Map<number, string[]> {
  const parsed = JSON.parse(rawJson) as { results: { id: number; tags: string[] }[] };
  return new Map(parsed.results.map((r) => [r.id, r.tags.filter((t) => VOCAB.has(t))]));
}

export async function tagStories(stories: Story[]): Promise<Map<number, string[]>> {
  if (stories.length === 0) return new Map();
  try {
    const response = await getClient().responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0,
      instructions: TAGGING_PROMPT,
      input: JSON.stringify(buildTagInput(stories)),
      text: {
        format: {
          type: 'json_schema',
          name: 'story_tags',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['results'],
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['id', 'tags'],
                  properties: {
                    id: { type: 'number' },
                    tags: { type: 'array', items: { type: 'string', enum: [...TAG_VOCAB] } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return parseTagResults(response.output_text);
  } catch (error) {
    console.error('tagStories failed', error);
    return new Map();
  }
}

const tagCache = new Map<number, string[]>();

export async function attachTags(
  stories: Story[],
  tagger: (s: Story[]) => Promise<Map<number, string[]>> = tagStories,
): Promise<Story[]> {
  const uncached = stories.filter((s) => !tagCache.has(s.id));
  if (uncached.length) {
    const fresh = await tagger(uncached);
    for (const s of uncached) tagCache.set(s.id, fresh.get(s.id) ?? []);
  }
  return stories.map((s) => ({ ...s, tags: tagCache.get(s.id) ?? [] }));
}
