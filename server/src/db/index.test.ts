import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { applySchema } from './index.js';

describe('applySchema', () => {
  it('creates an empty story_tags table', () => {
    const db = new DatabaseSync(':memory:');
    applySchema(db);

    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='story_tags'")
      .get();
    expect(table).toEqual({ name: 'story_tags' });

    const count = db.prepare('SELECT COUNT(*) AS n FROM story_tags').get() as { n: number };
    expect(count.n).toBe(0);
  });
});
