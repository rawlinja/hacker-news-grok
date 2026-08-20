import { Router } from 'express';
import { getStories } from '../lib/hn.js';
import { attachTags } from '../lib/llm/tagging.js';
import { FeedQuerySchema } from '../validate.js';

const router = Router();

router.get('/', async (req, res) => {
  const { feed, page } = FeedQuerySchema.parse(req.query);

  const stories = await getStories(feed, page);
  const storiesWithTags = await attachTags(stories);
  res.json(storiesWithTags);
});

export default router;
