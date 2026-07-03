import type { Story } from '../../types';
import { stripHtml } from '../hn';
import { fetchUrlExcerpt } from '../content';
import { getClient } from './client';
import { TAG_VOCAB, TAGGING_PROMPT } from './prompts';

const ALLOWED_TAGS = new Set<string>(TAG_VOCAB);
const MAX_TEXT_EXCERPT_CHARS = 1200;

export type ExcerptFetcher = (url?: string) => Promise<string>;

export async function collectExcerpts(
  stories: Story[],
  fetchExcerpt: ExcerptFetcher = fetchUrlExcerpt,
): Promise<Map<number, string>> {
  const entries = await Promise.all(
    stories.map(async (story): Promise<[number, string]> => {
      if (story.text) return [story.id, stripHtml(story.text).slice(0, MAX_TEXT_EXCERPT_CHARS)];
      return [story.id, await fetchExcerpt(story.url)];
    }),
  );

  return new Map(entries);
}

export function buildTagInput(stories: Story[], excerpts: Map<number, string>) {
  return stories.map((story) => ({
    id: story.id,
    title: story.title,
    url: story.url,
    type: story.type,
    excerpt: excerpts.get(story.id) ?? '',
  }));
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

export async function tagStories(
  stories: Story[],
  fetchExcerpt?: ExcerptFetcher,
): Promise<Map<number, string[]>> {
  if (stories.length === 0) return new Map();
  try {
    const excerpts = await collectExcerpts(stories, fetchExcerpt);
    const response = await getClient().responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0,
      instructions: TAGGING_PROMPT,
      input: JSON.stringify(buildTagInput(stories, excerpts)),
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
