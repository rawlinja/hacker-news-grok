# Eval dataset (private)

`tags.json` holds the labeled ground-truth dataset for the tagging eval.

To create your own:

1. Copy `tags.example.json` to `tags.json`.
2. Add real Hacker News stories (`id`, `title`, `url`, `type`) and label
   `expectedTags` from the vocabulary in `server/src/lib/llm/prompts.ts`.
3. Run `pnpm eval:snapshot` to freeze each linked page's excerpt into the file
   (makes runs deterministic and each label auditable offline).
4. Run `pnpm eval:tags`.
