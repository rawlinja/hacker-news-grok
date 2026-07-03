import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function applySchema(database: DatabaseSync): void {
  database.exec('PRAGMA journal_mode = WAL');
  database.exec(`CREATE TABLE IF NOT EXISTS story_tags (
  id   INTEGER PRIMARY KEY,
  tags TEXT NOT NULL
)`);
}

function openDatabase(): DatabaseSync {
  const path = process.env.DB_PATH ?? ':memory:';
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  applySchema(database);
  return database;
}

export const db = openDatabase();
