import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tagStories } from '../src/lib/llm/tagging';
import type { Story } from '../src/types';
import type { Case, RunReport, Thresholds } from './schema';
import { grade } from './graders/multilabel';
import { nextRunId, printReport, writeReport } from './report';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const THRESHOLDS: Thresholds = { macroF1: 0.7, exactMatchRate: 0.7 };

interface CliOptions {
  trials: number;
  storyId?: number;
  jsonOnly: boolean;
}

function parseOptions(argv: string[]): CliOptions {
  const options: CliOptions = { trials: 1, jsonOnly: false };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--trials') options.trials = Number(argv[++i]);
    else if (argv[i] === '--id') options.storyId = Number(argv[++i]);
    else if (argv[i] === '--json-only') options.jsonOnly = true;
  }

  return options;
}

function loadCases(): Case[] {
  const path = fileURLToPath(new URL('./dataset/tags.json', import.meta.url));
  return JSON.parse(readFileSync(path, 'utf8')) as Case[];
}

function caseToStory(testCase: Case): Story {
  return {
    id: testCase.id,
    title: testCase.title,
    url: testCase.url,
    type: testCase.type,
    by: '',
    score: 0,
    time: 0,
    descendants: 0,
    tags: [],
  };
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

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const cases = loadCases().filter(
    (testCase) => options.storyId === undefined || testCase.id === options.storyId,
  );

  if (cases.length === 0) throw new Error('No cases to run (check --id).');

  const stories = cases.map(caseToStory);
  const runs: Map<number, string[]>[] = [];
  for (let trial = 0; trial < options.trials; trial += 1) {
    runs.push(await tagStories(stories));
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
