import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { tagStories, type ExcerptFetcher } from '../src/lib/llm/tagging.js';
import type { Story } from '../src/types.js';
import type { Case, RunReport, Thresholds } from './schema.js';
import { caseToStory, loadCases } from './dataset.js';
import { grade } from './graders/multilabel.js';
import { type ComparisonEntry, nextRunId, printComparison, printReport, writeReport } from './report.js';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const THRESHOLDS: Thresholds = { macroF1: 0.4, exactMatchRate: 0.25 };

interface CliOptions {
  trials: number;
  storyId?: number;
  jsonOnly: boolean;
  live: boolean;
  model?: string;
  compare?: string[];
}

function parseOptions(argv: string[]): CliOptions {
  const options: CliOptions = { trials: 1, jsonOnly: false, live: false };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--trials') options.trials = Number(argv[++i]);
    else if (argv[i] === '--id') options.storyId = Number(argv[++i]);
    else if (argv[i] === '--json-only') options.jsonOnly = true;
    else if (argv[i] === '--live') options.live = true;
    else if (argv[i] === '--model') options.model = argv[++i];
    else if (argv[i] === '--compare') {
      options.compare = argv[++i]?.split(',').map((model) => model.trim()).filter(Boolean);
    }
  }

  return options;
}

function frozenExcerpts(cases: Case[]): ExcerptFetcher {
  const byUrl = new Map(cases.filter((c) => c.url).map((c) => [c.url as string, c.excerpt ?? '']));
  return async (url?: string) => (url ? (byUrl.get(url) ?? '') : '');
}

function consistencyAcross(runs: Map<number, string[]>[]): number {
  if (runs.length < 2) return 1;

  const signature = (tags: string[] = []) => [...tags].sort().join(',');
  const storyIds = [...runs[0].keys()];
  const stable = storyIds.filter((id) =>
    runs.every((run) => signature(run.get(id)) === signature(runs[0].get(id))),
  );

  return stable.length / storyIds.length;
}

type Scored = ReturnType<typeof grade>;

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

async function scoreModel(
  model: string,
  stories: Story[],
  cases: Case[],
  fetchExcerpt: ExcerptFetcher | undefined,
  trials: number,
): Promise<ComparisonEntry> {
  process.env.OPENAI_MODEL = model;

  const scores: Scored[] = [];
  for (let trial = 0; trial < trials; trial += 1) {
    scores.push(grade(cases, await tagStories(stories, fetchExcerpt)));
  }

  return {
    model,
    trials,
    microF1: mean(scores.map((score) => score.microF1)),
    macroF1: mean(scores.map((score) => score.macroF1)),
    exactMatchRate: mean(scores.map((score) => score.exactMatchRate)),
    perTag: scores[0].perTag.map((metrics, index) => ({
      ...metrics,
      f1: mean(scores.map((score) => score.perTag[index].f1)),
    })),
  };
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const cases = loadCases().filter(
    (testCase) => options.storyId === undefined || testCase.id === options.storyId,
  );

  if (cases.length === 0) throw new Error('No cases to run (check --id).');

  const stories = cases.map(caseToStory);
  const fetchExcerpt = options.live ? undefined : frozenExcerpts(cases);

  if (options.compare) {
    const entries: ComparisonEntry[] = [];
    for (const model of options.compare) {
      entries.push(await scoreModel(model, stories, cases, fetchExcerpt, options.trials));
    }
    printComparison(entries);
    return;
  }

  if (options.model) process.env.OPENAI_MODEL = options.model;

  const runs: Map<number, string[]>[] = [];
  for (let trial = 0; trial < options.trials; trial += 1) {
    runs.push(await tagStories(stories, fetchExcerpt));
  }

  const predictions = runs[0];

  // An empty result against a labeled set means a missing key or model error, not 0% quality.
  const anyExpected = cases.some((testCase) => testCase.expectedTags.length > 0);
  const anyPredicted = [...predictions.values()].some((tags) => tags.length > 0);
  if (anyExpected && !anyPredicted) {
    console.error('All predictions empty — likely missing OPENAI_API_KEY or a model error. See server/.env.');
    process.exit(2);
  }

  const scored = grade(cases, predictions);
  const timestamp = new Date().toISOString();
  const passed =
    scored.macroF1 >= THRESHOLDS.macroF1 && scored.exactMatchRate >= THRESHOLDS.exactMatchRate;

  const report: RunReport = {
    runId: nextRunId(timestamp),
    timestamp,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    trials: options.trials,
    totalCases: cases.length,
    ...scored,
    consistency: options.trials > 1 ? consistencyAcross(runs) : undefined,
    thresholds: THRESHOLDS,
    passed,
  };

  if (!options.jsonOnly) printReport(report);
  console.log(`\nReport written to ${writeReport(report)}`);
  process.exit(passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
