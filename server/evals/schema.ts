import { TAG_VOCAB } from '../src/lib/llm/prompts';

export type Tag = (typeof TAG_VOCAB)[number];

export type MetricScope = Tag | 'micro' | 'macro';

export interface Case {
  id: number;
  title: string;
  url?: string;
  type: string;
  expectedTags: Tag[];
  note?: string;
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
  perTag: TagMetrics[];
  micro: TagMetrics;
  macro: TagMetrics;
  consistency?: number;
  diffs: CaseDiff[];
  thresholds: Thresholds;
  passed: boolean;
}
