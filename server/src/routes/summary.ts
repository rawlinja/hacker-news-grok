import { Router } from 'express';
import { getStoryWithComments } from '../lib/hn.js';
import { summarizeDiscussion } from '../lib/llm/summary.js';
import { StoryIdParamsSchema } from '../validate.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const { id } = StoryIdParamsSchema.parse(req.params);

  const { story, comments } = await getStoryWithComments(id);
  const summary = await summarizeDiscussion(story, comments);
  res.json(summary);
});

export default router;
