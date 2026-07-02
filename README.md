# HN Grok

A Hacker News reader. Browse Top / New / Best, open a story to read its comments, get an AI summary of the thread, and filter the feed by AI topic tags.

Two small apps: an Express API that proxies HN and calls OpenAI, and a React + Vite front end.

## How to run it

**Needs:** Node 20+, pnpm, and an OpenAI key (for summaries and tags).

```bash
cp server/.env.example server/.env    # set OPENAI_API_KEY=...
./scripts/start.sh                    # server :3001, client :5173. Ctrl+C stops both
```

Open http://localhost:5173. Run the tests with `./scripts/test.sh` (both suites), or one at a time with `pnpm --dir server test` and `pnpm --dir client test`.

## What I built

The feed and story data come from Hacker News's API, so that part was already in place. My focus was requirements 3 and 4. I send the story and its comment thread to the LLM to generate a summary. Each story is also tagged from a small fixed set of topics so the feed can be filtered.

## What works

All four requirements work:

1. Browse the Top / New / Best feed.
2. Open a story and read its comments.
3. Get an AI summary of the discussion.
4. Find the articles I care about, by filtering the feed on topic tags.

## What's incomplete

Sort, keyword search, and chat were considered and cut.

## Tradeoffs

- **Tagging, not search.** For "find what I care about," I had the AI label each story by topic and let you filter on those labels. I opted not to implement a search box.
- **A small fixed set of tags, not open-ended.** A handful of topics instead of free-form. The AI can only pick from the list.
- **Filter the loaded feed, not all of HN.** Filtering runs over the stories already loaded (~30-90), and not the whole site.
- **Tag from the title, URL, and type, not the article.** I tag from the data already returned by the Hacker News feed instead of fetching every linked article. It's faster and cheaper, but vague or misleading titles can be misclassified.

## How I used AI

**In the product:** OpenAI generates the discussion summaries and topic tags. The tagging feature uses structured output, and the model only returns values from a fixed list.

**To build it:** I built this with an AI coding assistant, but drove the design and architecture. I used the assistant to challenge my assumptions, and had it flag what I hadn't considered. It proposed options and I made the final decision. Throughout the process, we used TDD, where it implemented each feature by first writing a failing test, followed by the code to make it pass.

## What I'd do with more time

- **Expand discovery beyond the loaded feed.** Right now tags are only generated for the stories in memory. To search across all of Hacker News, I'd probably integrate the Algolia HN Search API, which already indexes the site.
- **Search with plain English.** Instead of clicking tags, users could ask for something like "AI/ML deep dives." The LLM would map that request to the existing tags before filtering the results.
- **Evaluate tag quality.** I'd build a small evaluation set to measure how consistently the LLM classifies discussions before expanding the tag vocabulary or relying on it for search.
