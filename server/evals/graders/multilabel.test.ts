import { describe, it, expect } from 'vitest';
import { grade } from './multilabel.js';
import { TAGS } from '../../src/types.js';
import type { Case } from '../schema.js';

const buildCase = (id: number, expectedTags: Case['expectedTags']): Case => ({
  id,
  title: `t${id}`,
  type: 'story',
  expectedTags,
});

describe('grade', () => {
  it('scores a perfect run as 100% exact match and F1 = 1', () => {
    const cases = [buildCase(1, ['ai_ml']), buildCase(2, ['paper', 'science_research'])];
    const predictions = new Map<number, string[]>([
      [1, ['ai_ml']],
      [2, ['science_research', 'paper']],
    ]);

    const result = grade(cases, predictions);

    expect(result.exactMatchRate).toBe(1);
    expect(result.microF1).toBe(1);
    expect(result.macroF1).toBe(1);
    expect(result.diffs).toEqual([]);
  });

  it('counts false positives and false negatives per tag', () => {
    const cases = [buildCase(1, ['ai_ml']), buildCase(2, [])];
    const predictions = new Map<number, string[]>([
      [1, []],
      [2, ['ai_ml']],
    ]);

    const result = grade(cases, predictions);
    const aiml = result.perTag.find((metrics) => metrics.tag === 'ai_ml')!;

    expect(aiml.falseNegatives).toBe(1);
    expect(aiml.falsePositives).toBe(1);
    expect(result.exactMatchRate).toBe(0);
    expect(result.diffs).toHaveLength(2);
  });

  it('records missing and extra tags in diffs', () => {
    const cases = [buildCase(1, ['ai_ml', 'paper'])];
    const predictions = new Map<number, string[]>([[1, ['ai_ml', 'technical_deep_dive']]]);

    const [diff] = grade(cases, predictions).diffs;

    expect(diff.missing).toEqual(['paper']);
    expect(diff.extra).toEqual(['technical_deep_dive']);
  });

  it('excludes tags with no support from the macro average', () => {
    const cases = [buildCase(1, ['ai_ml'])];
    const predictions = new Map<number, string[]>([[1, ['ai_ml']]]);

    const result = grade(cases, predictions);

    expect(result.macroF1).toBe(1);
    expect(result.perTag).toHaveLength(TAGS.length);
  });

  it('ignores tags outside the vocab in per-tag counts', () => {
    const cases = [buildCase(1, ['ai_ml'])];
    const predictions = new Map<number, string[]>([[1, ['ai_ml', 'bogus']]]);

    const result = grade(cases, predictions);

    expect(result.perTag.find((metrics) => metrics.tag === 'ai_ml')!.truePositives).toBe(1);
  });
});
