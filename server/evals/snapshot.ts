import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectExcerpts } from '../src/lib/llm/tagging';
import { DATASET_PATH, caseToStory, loadCases } from './dataset';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

async function main(): Promise<void> {
  const cases = loadCases();
  const excerpts = await collectExcerpts(cases.map(caseToStory));

  const snapshotted = cases.map((testCase) => ({ ...testCase, excerpt: excerpts.get(testCase.id) ?? '' }));
  writeFileSync(DATASET_PATH, `${JSON.stringify(snapshotted, null, 2)}\n`);

  const withContent = snapshotted.filter((testCase) => testCase.excerpt).length;
  console.log(`Snapshotted ${snapshotted.length} cases (${withContent} with page content).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
