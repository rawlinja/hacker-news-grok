import type { Story, Comment, StorySummary } from '../../types.js';
import { stripHtml } from '../hn.js';
import { getClient } from './client.js';
import { SUMMARY_PROMPT } from './prompts.js';

export interface TranscriptResult {
  transcript: string;
  commentsUsed: number;
}

export function buildTranscript(comments: Comment[]): TranscriptResult {
  const lines: string[] = [];

  const appendCommentLines = (nodes: Comment[], depth: number) => {
    for (const comment of nodes) {
      lines.push(`${'  '.repeat(depth)}${comment.by}: ${stripHtml(comment.text)}`);

      if (comment.replies.length > 0) {
        appendCommentLines(comment.replies, depth + 1);
      }
    }
  };

  appendCommentLines(comments, 0);

  return { transcript: lines.join('\n'), commentsUsed: lines.length };
}

export async function summarizeDiscussion(
  story: Story,
  comments: Comment[],
): Promise<StorySummary> {
  const { transcript, commentsUsed } = buildTranscript(comments);
  if (commentsUsed === 0) {
    return { summary: 'No comments to summarize yet.', commentsUsed: 0 };
  }

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
