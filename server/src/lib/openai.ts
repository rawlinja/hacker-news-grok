import OpenAI from 'openai';
import type { Story, Comment, StorySummary } from '../types';
import { stripHtml } from './hn';

const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You summarize Hacker News discussion threads for someone skimming the site.
Given a story title and its comments, write:
- a 1-2 sentence TL;DR of what the discussion is about, then
- 3-5 short bullets covering the main points, the strongest disagreement, and any notable insight.
Be concise and neutral. Summarize only what the comments actually say; do not invent points.`;

let openaiClient: OpenAI | null = null;
function getClient(): OpenAI {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

/** Flatten a comment tree into an indented `author: text` transcript for the prompt. */
export function buildTranscript(comments: Comment[]): string {
  const lines: string[] = [];
  const walk = (nodes: Comment[], depth: number) => {
    for (const comment of nodes) {
      lines.push(`${'  '.repeat(depth)}${comment.by}: ${stripHtml(comment.text)}`);
      if (comment.replies.length) walk(comment.replies, depth + 1);
    }
  };
  walk(comments, 0);
  return lines.join('\n');
}

function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0);
}

export async function summarizeDiscussion(story: Story, comments: Comment[]): Promise<StorySummary> {
  const commentsUsed = countComments(comments);
  if (commentsUsed === 0) {
    return { summary: 'No comments to summarize yet.', commentsUsed: 0 };
  }

  const transcript = buildTranscript(comments);
  try {
    const response = await getClient().responses.create({
      model: MODEL,
      instructions: SYSTEM_PROMPT,
      input: `Story: ${story.title}\n\nComments:\n${transcript}`,
    });
    const summary = response.output_text?.trim() || 'Summary unavailable.';
    return { summary, commentsUsed };
  } catch (error) {
    console.error('summarizeDiscussion failed', error);
    return { summary: 'Summary unavailable.', commentsUsed };
  }
}
