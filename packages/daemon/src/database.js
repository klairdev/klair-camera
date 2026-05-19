import { DatabaseSync } from 'node:sqlite';
import { DB_PATH, ensureKlairDir } from './paths.js';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    file TEXT NOT NULL,
    event_type TEXT NOT NULL,
    git_diff TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
`;

export function openDatabase(dbPath = DB_PATH) {
  ensureKlairDir();
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec(SCHEMA);
  return db;
}

export function insertEvent(db, { timestamp, file, eventType, gitDiff }) {
  const stmt = db.prepare(`
    INSERT INTO events (timestamp, file, event_type, git_diff)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(timestamp, file, eventType, gitDiff ?? '');
}

export function getLastEvents(db, limit = 10) {
  const stmt = db.prepare(
    `SELECT id, timestamp, file, event_type AS eventType, git_diff AS gitDiff
     FROM events
     ORDER BY timestamp DESC, id DESC
     LIMIT ?`
  );
  return stmt.all(limit);
}
