import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { applySchema } from '../../db/index.js';
import { createSqliteTagStore } from './tagStore.js';

function freshStore() {
  const db = new DatabaseSync(':memory:');
  applySchema(db);
  return createSqliteTagStore(db);
}

describe('createSqliteTagStore', () => {
  it('round-trips tags by id and returns only hits', () => {
    const store = freshStore();
    store.setMany(
      new Map([
        [1, ['ai_ml']],
        [2, []],
      ]),
    );

    const hits = store.getMany([1, 2, 3]);
    expect(hits.get(1)).toEqual(['ai_ml']);
    expect(hits.get(2)).toEqual([]); // a real "no tags" answer is cached
    expect(hits.has(3)).toBe(false); // absent id is omitted
  });

  it('keeps the first write for an id (INSERT OR IGNORE)', () => {
    const store = freshStore();
    store.setMany(new Map([[1, ['ai_ml']]]));
    store.setMany(new Map([[1, ['paper']]]));
    expect(store.getMany([1]).get(1)).toEqual(['ai_ml']);
  });

  it('returns an empty map when asked for no ids', () => {
    expect(freshStore().getMany([]).size).toBe(0);
  });
});
