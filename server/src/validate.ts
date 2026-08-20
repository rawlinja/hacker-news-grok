import { z } from 'zod';
import { FEEDS } from './types.js';

export const FeedQuerySchema = z.object({
  feed: z.enum(FEEDS).default('top'),
  page: z.coerce.number().int().min(0).default(0),
});

export const StoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
