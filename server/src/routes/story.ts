import { Router } from 'express';
import { getStoryWithComments } from '../lib/hn.js';
import { StoryIdParamsSchema } from '../validate.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const { id } = StoryIdParamsSchema.parse(req.params);

  const detail = await getStoryWithComments(id);
  res.json(detail);
});

export default router;
