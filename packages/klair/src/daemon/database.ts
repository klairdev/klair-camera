import initSqlJs, { type Database, type SqlJsStatic, type QueryExecResult } from 'sql.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { DB_PATH, KLAIR_DIR } from '../shared/constants.js';
import type { Session, FileEvent, Diff } from '../shared/types.js';

let SQL: SqlJsStatic;
let db: Database;

export async function initDatabase(): Promise<Database> {
  if (!existsSync(KLAIR_DIR)) {
    mkdirSync(KLAIR_DIR, { recursive: true });
  }

  SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_path TEXT NOT NULL,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      diff_id TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS diffs (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      content TEXT NOT NULL,
      file_path TEXT NOT NULL,
      lines_added INTEGER NOT NULL DEFAULT 0,
      lines_removed INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)');
  db.run('CREATE INDEX IF NOT EXISTS idx_diffs_event ON diffs(event_id)');

  saveDb();
  return db;
}

function saveDb(): void {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// --- Query helpers ---

function execOne(sql: string, params?: unknown[]): QueryExecResult | undefined {
  return getDb().exec(sql, params)[0];
}

function mapRows<T>(result: QueryExecResult | undefined, mapper: (row: Record<string, unknown>) => T): T[] {
  if (!result) return [];
  const { columns, values } = result;
  return values.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return mapper(obj);
  });
}

function mapOne<T>(result: QueryExecResult | undefined, mapper: (row: Record<string, unknown>) => T): T | undefined {
  return mapRows(result, mapper)[0];
}

// --- Session operations ---

export function createSession(session: Session): void {
  getDb().run(
    'INSERT INTO sessions (id, project_path, name, started_at, last_active_at, status) VALUES (?, ?, ?, ?, ?, ?)',
    [session.id, session.projectPath, session.name, session.startedAt, session.lastActiveAt, session.status]
  );
  saveDb();
}

export function getSession(id: string): Session | undefined {
  return mapOne(execOne('SELECT * FROM sessions WHERE id = ?', [id]), mapRowToSession);
}

export function getAllSessions(): Session[] {
  return mapRows(execOne('SELECT * FROM sessions ORDER BY last_active_at DESC'), mapRowToSession);
}

export function getActiveSession(): Session | undefined {
  return mapOne(execOne("SELECT * FROM sessions WHERE status = 'active' ORDER BY last_active_at DESC LIMIT 1"), mapRowToSession);
}

export function updateSessionStatus(id: string, status: Session['status']): void {
  getDb().run('UPDATE sessions SET status = ?, last_active_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);
  saveDb();
}

export function clearSessionEvents(sessionId: string): void {
  getDb().run('DELETE FROM diffs WHERE event_id IN (SELECT id FROM events WHERE session_id = ?)', [sessionId]);
  getDb().run('DELETE FROM events WHERE session_id = ?', [sessionId]);
  saveDb();
}

export function getSessionCount(): number {
  const result = execOne('SELECT COUNT(*) as count FROM sessions');
  return (result?.values[0]?.[0] as number) ?? 0;
}

export function getTotalEventCount(): number {
  const result = execOne('SELECT COUNT(*) as count FROM events');
  return (result?.values[0]?.[0] as number) ?? 0;
}

// --- Event operations ---

export function addEvent(event: FileEvent): void {
  getDb().run(
    'INSERT INTO events (id, session_id, file_path, event_type, timestamp, diff_id) VALUES (?, ?, ?, ?, ?, ?)',
    [event.id, event.sessionId, event.filePath, event.eventType, event.timestamp, event.diffId || null]
  );
  saveDb();
}

export function getEvents(sessionId: string, limit = 100): FileEvent[] {
  return mapRows(
    execOne('SELECT * FROM events WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?', [sessionId, limit]),
    mapRowToFileEvent
  );
}

export function getEventCount(sessionId: string): number {
  const result = execOne('SELECT COUNT(*) as count FROM events WHERE session_id = ?', [sessionId]);
  if (!result) return 0;
  return (result.values[0]?.[0] as number) ?? 0;
}

export function getEventById(id: string): FileEvent | undefined {
  return mapOne(execOne('SELECT * FROM events WHERE id = ?', [id]), mapRowToFileEvent);
}

// --- Diff operations ---

export function addDiff(diff: Diff): void {
  getDb().run(
    'INSERT INTO diffs (id, event_id, content, file_path, lines_added, lines_removed) VALUES (?, ?, ?, ?, ?, ?)',
    [diff.id, diff.eventId, diff.content, diff.filePath, diff.linesAdded, diff.linesRemoved]
  );
  saveDb();
}

export function getDiffByEventId(eventId: string): Diff | undefined {
  return mapOne(execOne('SELECT * FROM diffs WHERE event_id = ?', [eventId]), mapRowToDiff);
}

export function getDiffById(id: string): Diff | undefined {
  return mapOne(execOne('SELECT * FROM diffs WHERE id = ?', [id]), mapRowToDiff);
}

// --- Settings operations ---

export function getSetting(key: string): string | undefined {
  const result = execOne('SELECT value FROM settings WHERE key = ?', [key]);
  return result?.values[0]?.[0] as string | undefined;
}

export function setSetting(key: string, value: string): void {
  getDb().run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  saveDb();
}

export function getAllSettings(): Record<string, string> {
  const result = execOne('SELECT key, value FROM settings');
  if (!result) return {};
  const settings: Record<string, string> = {};
  for (const row of result.values) {
    settings[row[0] as string] = row[1] as string;
  }
  return settings;
}

// --- Row mappers ---

function mapRowToSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    projectPath: row.project_path as string,
    name: row.name as string,
    startedAt: row.started_at as string,
    lastActiveAt: row.last_active_at as string,
    status: row.status as Session['status'],
  };
}

function mapRowToFileEvent(row: Record<string, unknown>): FileEvent {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    filePath: row.file_path as string,
    eventType: row.event_type as FileEvent['eventType'],
    timestamp: row.timestamp as string,
    diffId: (row.diff_id as string) || undefined,
  };
}

function mapRowToDiff(row: Record<string, unknown>): Diff {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    content: row.content as string,
    filePath: row.file_path as string,
    linesAdded: row.lines_added as number,
    linesRemoved: row.lines_removed as number,
  };
}
