import { Router } from 'express';
import { getStories } from '../lib/hn';
import { attachTags } from '../lib/llm/tagging';
import type { Feed } from '../types';

const VALID_FEEDS: Feed[] = ['top', 'new', 'best'];
const router = Router();

router.get('/', async (req, res) => {
  const requestedFeed = String(req.query.feed ?? 'top');
  
  const feed: Feed = (VALID_FEEDS as string[]).includes(requestedFeed)
    ? (requestedFeed as Feed)
    : 'top';
  
  const page = Number.parseInt(String(req.query.page ?? '0'), 10) || 0;

  const stories = await getStories(feed, page);
  res.json(await attachTags(stories));
});

export default router;
