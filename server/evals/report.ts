import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { RunReport, TagMetrics } from './schema.js';

const RESULTS_DIR = fileURLToPath(new URL('./results/', import.meta.url));
const COLUMN_WIDTHS = [22, 5, 5, 5, 8, 8, 8];

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRow(cells: string[]): string {
  return cells.map((cell, index) => cell.padEnd(COLUMN_WIDTHS[index])).join('  ');
}

export function nextRunId(timestamp: string): string {
  mkdirSync(RESULTS_DIR, { recursive: true });

  const day = timestamp.slice(0, 10);
  const existing = readdirSync(RESULTS_DIR).filter((name) => name.startsWith(`run_${day}_`));
  const sequence = String(existing.length + 1).padStart(2, '0');

  return `run_${day}_${sequence}`;
}

export function printReport(report: RunReport): void {
  const printMetricsRow = (metrics: TagMetrics) =>
    console.log(formatRow([
      String(metrics.tag),
      String(metrics.truePositives),
      String(metrics.falsePositives),
      String(metrics.falseNegatives),
      percent(metrics.precision),
      percent(metrics.recall),
      percent(metrics.f1),
    ]));

  const header = formatRow(['tag', 'tp', 'fp', 'fn', 'prec', 'recall', 'f1']);

  console.log(
    `\nTagging eval — ${report.runId}  ` +
    `(model: ${report.model}, ${report.totalCases} cases, ${report.trials} trial(s))`,
  );
  console.log(header);
  console.log('-'.repeat(header.length));

  report.perTag.forEach(printMetricsRow);

  console.log('-'.repeat(header.length));
  printMetricsRow(report.micro);
  printMetricsRow(report.macro);

  console.log(`\nExact-match rate: ${percent(report.exactMatchRate)}`);
  if (report.consistency !== undefined) {
    console.log(`Consistency across ${report.trials} trials: ${percent(report.consistency)}`);
  }

  if (report.diffs.length > 0) {
    console.log(`\nMismatches (${report.diffs.length}):`);

    for (const diff of report.diffs) {
      console.log(`  #${diff.id} ${diff.title}`);
      console.log(`    expected: [${diff.expected.join(', ')}]  got: [${diff.predicted.join(', ')}]`);
      if (diff.missing.length > 0) console.log(`    missing:  ${diff.missing.join(', ')}`);
      if (diff.extra.length > 0) console.log(`    extra:    ${diff.extra.join(', ')}`);
    }
  }

  console.log(
    `\nThresholds: macroF1 ≥ ${percent(report.thresholds.macroF1)}, ` +
    `exact-match ≥ ${percent(report.thresholds.exactMatchRate)}`,
  );
  console.log(report.passed ? '✅ PASS' : '❌ FAIL');
}

export interface ComparisonEntry {
  model: string;
  trials: number;
  microF1: number;
  macroF1: number;
  exactMatchRate: number;
  perTag: TagMetrics[];
}

export function printComparison(entries: ComparisonEntry[]): void {
  const modelWidth = Math.max(6, ...entries.map((entry) => entry.model.length));

  console.log(`\nModel comparison — ${entries[0].trials} trial(s), frozen inputs`);
  console.log('model'.padEnd(modelWidth) + '   macroF1  microF1    exact');
  for (const entry of entries) {
    console.log(
      entry.model.padEnd(modelWidth) +
        '   ' + percent(entry.macroF1).padStart(6) +
        '   ' + percent(entry.microF1).padStart(6) +
        '   ' + percent(entry.exactMatchRate).padStart(6),
    );
  }

  const supported = entries[0].perTag
    .map((_, index) => index)
    .filter((index) =>
      entries.some((entry) => {
        const metrics = entry.perTag[index];
        return metrics.truePositives + metrics.falsePositives + metrics.falseNegatives > 0;
      }),
    );

  console.log('\nPer-tag F1:');
  console.log('tag'.padEnd(28) + entries.map((entry) => entry.model.padStart(modelWidth + 2)).join(''));
  for (const index of supported) {
    const label = String(entries[0].perTag[index].tag).padEnd(28);
    const cells = entries.map((entry) => percent(entry.perTag[index].f1).padStart(modelWidth + 2)).join('');
    console.log(label + cells);
  }
}

export function writeReport(report: RunReport): string {
  mkdirSync(RESULTS_DIR, { recursive: true });

  const path = `${RESULTS_DIR}${report.runId}.json`;
  writeFileSync(path, JSON.stringify(report, null, 2));

  return path;
}
