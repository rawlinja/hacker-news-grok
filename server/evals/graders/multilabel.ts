import { TAGS } from '../../src/types.js';
import type { Case, CaseDiff, MetricScope, RunReport, TagMetrics } from '../schema.js';

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function toMetrics(
  tag: MetricScope,
  truePositives: number,
  falsePositives: number,
  falseNegatives: number,
): TagMetrics {
  const precision = ratio(truePositives, truePositives + falsePositives);
  const recall = ratio(truePositives, truePositives + falseNegatives);
  const f1 = ratio(2 * precision * recall, precision + recall);

  return { tag, truePositives, falsePositives, falseNegatives, precision, recall, f1 };
}

type Scored = Pick<
  RunReport,
  'perTag' | 'micro' | 'macro' | 'microF1' | 'macroF1' | 'exactMatchRate' | 'diffs'
>;

export function grade(cases: Case[], predictions: Map<number, string[]>): Scored {
  const perTag = TAGS.map((tag) => {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const testCase of cases) {
      const expected = new Set<string>(testCase.expectedTags);
      const predicted = new Set(predictions.get(testCase.id) ?? []);

      if (expected.has(tag) && predicted.has(tag)) truePositives += 1;
      else if (predicted.has(tag)) falsePositives += 1;
      else if (expected.has(tag)) falseNegatives += 1;
    }

    return toMetrics(tag, truePositives, falsePositives, falseNegatives);
  });

  const sumOf = (metrics: TagMetrics[], pick: (m: TagMetrics) => number) =>
    metrics.reduce((total, m) => total + pick(m), 0);

  const micro = toMetrics(
    'micro',
    sumOf(perTag, (m) => m.truePositives),
    sumOf(perTag, (m) => m.falsePositives),
    sumOf(perTag, (m) => m.falseNegatives),
  );

  // Average only over tags the dataset actually exercises, so absent tags don't
  // drag the score down and a perfect run stays 1.0 on any subset.
  const supported = perTag.filter((m) => m.truePositives + m.falsePositives + m.falseNegatives > 0);

  const macro: TagMetrics = {
    tag: 'macro',
    truePositives: micro.truePositives,
    falsePositives: micro.falsePositives,
    falseNegatives: micro.falseNegatives,
    precision: ratio(
      sumOf(supported, (m) => m.precision),
      supported.length,
    ),
    recall: ratio(
      sumOf(supported, (m) => m.recall),
      supported.length,
    ),
    f1: ratio(
      sumOf(supported, (m) => m.f1),
      supported.length,
    ),
  };

  const diffs: CaseDiff[] = [];
  let exactMatches = 0;

  for (const testCase of cases) {
    const expected = new Set(testCase.expectedTags);
    const predicted = new Set(predictions.get(testCase.id) ?? []);

    if (expected.symmetricDifference(predicted).size === 0) {
      exactMatches += 1;
      continue;
    }

    diffs.push({
      id: testCase.id,
      title: testCase.title,
      expected: testCase.expectedTags,
      predicted: [...predicted],
      missing: [...expected.difference(predicted)],
      extra: [...predicted.difference(expected)],
    });
  }

  return {
    perTag,
    micro,
    macro,
    microF1: micro.f1,
    macroF1: macro.f1,
    exactMatchRate: ratio(exactMatches, cases.length),
    diffs,
  };
}
