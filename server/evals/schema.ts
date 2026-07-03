import type { Tag } from '../src/types.js';

export type MetricScope = Tag | 'micro' | 'macro';

export interface Case {
  id: number;
  title: string;
  url?: string;
  type: string;
  expectedTags: Tag[];
  note?: string;
  excerpt?: string; // frozen page text, populated by `pnpm eval:snapshot`
}

export interface TagMetrics {
  tag: MetricScope;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface CaseDiff {
  id: number;
  title: string;
  expected: Tag[];
  predicted: string[];
  missing: string[];
  extra: string[];
}

export interface Thresholds {
  macroF1: number;
  exactMatchRate: number;
}

export interface RunReport {
  runId: string;
  timestamp: string;
  model: string;
  trials: number;
  totalCases: number;
  microF1: number;
  macroF1: number;
  exactMatchRate: number;
  perTag: TagMetrics[];
  micro: TagMetrics;
  macro: TagMetrics;
  consistency?: number | undefined;
  diffs: CaseDiff[];
  thresholds: Thresholds;
  passed: boolean;
}
