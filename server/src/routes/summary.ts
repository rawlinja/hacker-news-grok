import { Router } from 'express';
import { getStoryWithComments } from '../lib/hn.js';
import { summarizeDiscussion } from '../lib/llm/summary.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const storyId = Number(req.params.id);
  
  if (!Number.isInteger(storyId)) {
    res.status(400).json({ error: 'Invalid story id' });
    return;
  }

  const { story, comments } = await getStoryWithComments(storyId);
  const summary = await summarizeDiscussion(story, comments);
  res.json(summary);
});

export default router;
