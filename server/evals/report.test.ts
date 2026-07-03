import { describe, it, expect } from 'vitest';
import { nextRunId } from './report.js';

describe('nextRunId', () => {
  it('produces a per-day sequenced id of the shape run_YYYY-MM-DD_NN', () => {
    const id = nextRunId('2026-07-02T12:00:00.000Z');
    expect(id).toMatch(/^run_2026-07-02_\d{2}$/);
  });
});
