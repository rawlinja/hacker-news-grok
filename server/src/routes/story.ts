import { Router } from 'express';
import { getStoryWithComments } from '../lib/hn';

const router = Router();

router.get('/:id', async (req, res) => {
  const storyId = Number(req.params.id);
  
  if (!Number.isInteger(storyId)) {
    res.status(400).json({ error: 'Invalid story id' });
    return;
  }

  const detail = await getStoryWithComments(storyId);
  res.json(detail);
});

export default router;
