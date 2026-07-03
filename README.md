# HN Grok

[![CI](https://github.com/rawlinja/hacker-news-grok/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rawlinja/hacker-news-grok/actions/workflows/ci.yml)

Hacker News reader: browse Top / New / Best, read a story's comments, get an AI-generated summary of the discussion, and filter the feed by topic tags.

- `server/` — Express 5 API (TypeScript, ESM). Proxies the Hacker News API and calls OpenAI. Runs on `:3001`.
- `client/` — React 19 + Vite SPA. Runs on `:5173`, proxies `/api` to the server in dev.

## Prerequisites

- Node 24+
- pnpm 11+
- An OpenAI API key (for summaries and tagging; browsing works without one)

## Setup

```bash
cp server/.env.example server/.env   # then set OPENAI_API_KEY
```

`server/.env`:

- `OPENAI_API_KEY` — required for AI summaries and tagging
- `OPENAI_MODEL` — default `gpt-4o-mini`
- `PORT` — default `3001`

## Development

```bash
./scripts/start.sh   # server :3001 + client :5173, hot reload, Ctrl+C stops both
```

Open http://localhost:5173. Or run each app on its own with `pnpm --dir server dev` / `pnpm --dir client dev`.

## Production

```bash
pnpm --dir server build && pnpm --dir server start   # esbuild bundle -> node dist/index.js
pnpm --dir client build                              # static site in client/dist
```

The built client is static files that call `/api` on their own origin. In production, put a reverse proxy in front that serves `client/dist` and routes `/api/*` to the server.

## Scripts (per app)

| Script | Server | Client |
| --- | --- | --- |
| `dev` | tsx watch | vite |
| `build` | esbuild | vite |
| `start` | `node dist` | — |
| `typecheck` | tsc | tsc |
| `lint` / `format` | eslint / prettier | eslint / prettier |
| `test` | vitest | vitest |

## Structure

- `server/src/` — HN gateway, OpenAI (summaries + tagging), routes
- `server/evals/` — tagging eval harness (labeled dataset is private, gitignored)
- `client/src/` — pages, components, feed store, API client