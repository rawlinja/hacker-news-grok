import { Router } from 'express';
import { getStoryWithComments } from '../lib/hn';
import { summarizeDiscussion } from '../lib/openai';

const router = Router();

router.get('/:id', async (req, res) => {
  const storyId = Number(req.params.id);
  if (!Number.isInteger(storyId)) {
    res.status(400).json({ error: 'Invalid story id' });
    return;
  }

  const { story, comments } = await getStoryWithComments(storyId);
  res.json(await summarizeDiscussion(story, comments));
});

export default router;
