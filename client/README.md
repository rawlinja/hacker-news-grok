# HN Grok — Client

React + Vite SPA for the HN Grok spine: browse Top/New/Best feeds, open a story, read its comments, and generate an on-demand AI summary of the discussion.

## Run

The client expects the API server on `http://localhost:3001` (Vite proxies `/api/*` to it).

```bash
pnpm --filter server dev    # terminal 1 (needs server/.env with OPENAI_API_KEY)
pnpm --filter client dev    # terminal 2
```

## Test

```bash
pnpm --filter client test
```

## Structure

- `src/api.ts` — typed wrappers over `/api/*`
- `src/lib/format.ts` — render helpers (relative age, domain, HN link)
- `src/pages/` — `Home` (feed) and `Story` (detail)
- `src/components/` — `StoryCard`, `Summary`, `CommentList`, `StatusMessage`
