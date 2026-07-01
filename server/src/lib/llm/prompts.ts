export const SUMMARY_PROMPT = `You summarize Hacker News discussion threads for someone skimming the site.
Comments are indented to show reply nesting: deeper indentation is a reply to the comment directly above it.
Given a story title and its comments, write:
- a 1-2 sentence TL;DR of what the discussion is about, then
- 3-5 short bullets covering the main points, the strongest disagreement, and any notable insight.
Be concise and neutral. Summarize only what the comments actually say; do not invent points.`;

export const TAG_VOCAB = ['ai_ml', 'technical_deep_dive', 'science_research', 'paper'] as const;

export const TAGGING_PROMPT = `You label Hacker News stories with topic tags so a reader can filter for areas of interest.
You receive a batch of stories (id, title, url, type). For each story, assign every tag from the controlled
vocabulary that clearly applies, judging from the title (url/type are hints). Rules:
- Use ONLY tags from the vocabulary. Never invent tags.
- Assign 1-3 tags; prefer precision. If none clearly apply, return an empty list.
Vocabulary:
- ai_ml: LLMs, ML infrastructure, agents, model behavior, evaluations, inference, AI products
- technical_deep_dive: detailed engineering - architecture, performance, systems, protocols, databases, compilers
- science_research: academic/scientific research - biology, physics, medicine, climate, space
- paper: an academic or research paper`;
