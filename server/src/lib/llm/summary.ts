import type { Story, Comment, StorySummary } from '../../types';
import { stripHtml } from '../hn';
import { getClient } from './client';
import { SUMMARY_PROMPT } from './prompts';

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
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      instructions: SUMMARY_PROMPT,
      input: `Story: ${story.title}\n\nComments:\n${transcript}`,
    });
    const summary = response.output_text?.trim() || 'Summary unavailable.';
    return { summary, commentsUsed };
  } catch (error) {
    console.error('summarizeDiscussion failed', error);
    return { summary: 'Summary unavailable.', commentsUsed };
  }
}
