import type { Story } from '../../types';
import { getClient } from './client';
import { TAG_VOCAB, TAGGING_PROMPT } from './prompts';

const ALLOWED_TAGS = new Set<string>(TAG_VOCAB);

export function buildTagInput(stories: Story[]) {
  return stories.map((story) => ({ id: story.id, title: story.title, url: story.url, type: story.type }));
}

export function parseTagResults(rawJson: string): Map<number, string[]> {
  const parsedResponse = JSON.parse(rawJson) as { results: { id: number; tags: string[] }[] };
  return new Map(
    parsedResponse.results.map((result) => [
      result.id,
      result.tags.filter((tag) => ALLOWED_TAGS.has(tag)),
    ]),
  );
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
  tagger: (stories: Story[]) => Promise<Map<number, string[]>> = tagStories,
): Promise<Story[]> {
  const untaggedStories = stories.filter((story) => !tagCache.has(story.id));
  if (untaggedStories.length > 0) {
    const freshTags = await tagger(untaggedStories);
    for (const story of untaggedStories) {
      tagCache.set(story.id, freshTags.get(story.id) ?? []);
    }
  }
  return stories.map((story) => ({ ...story, tags: tagCache.get(story.id) ?? [] }));
}
