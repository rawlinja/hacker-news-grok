import type { DatabaseSync } from 'node:sqlite';

export interface TagStore {
  getMany(ids: number[]): Map<number, string[]>;
  setMany(entries: Map<number, string[]>): void;
}

export function createSqliteTagStore(database: DatabaseSync): TagStore {
  return {
    getMany(ids) {
      const hits = new Map<number, string[]>();
      if (ids.length === 0) return hits;

      const placeholders = ids.map(() => '?').join(',');
      const rows = database
        .prepare(`SELECT id, tags FROM story_tags WHERE id IN (${placeholders})`)
        .all(...ids) as { id: number; tags: string }[];

      for (const row of rows) {
        try {
          hits.set(row.id, JSON.parse(row.tags) as string[]);
        } catch {
          // malformed row -> treat as a miss so it gets recomputed, never throw
        }
      }
      return hits;
    },

    setMany(entries) {
      if (entries.size === 0) return;

      const insert = database.prepare('INSERT OR IGNORE INTO story_tags (id, tags) VALUES (?, ?)');
      database.exec('BEGIN');
      try {
        for (const [id, tags] of entries) {
          insert.run(id, JSON.stringify(tags));
        }
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
