import { Router } from 'express';
import { getStories } from '../lib/hn.js';
import { attachTags } from '../lib/llm/tagging.js';
import type { Feed } from '../types.js';

const VALID_FEEDS: Feed[] = ['top', 'new', 'best'];
const router = Router();

router.get('/', async (req, res) => {
  const requestedFeed = String(req.query.feed ?? 'top');

  const feed: Feed = (VALID_FEEDS as string[]).includes(requestedFeed)
    ? (requestedFeed as Feed)
    : 'top';

  const page = Number.parseInt(String(req.query.page ?? '0'), 10) || 0;

  const stories = await getStories(feed, page);
  const storiesWithTags = await attachTags(stories);
  res.json(storiesWithTags);
});

export default router;
