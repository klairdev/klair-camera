import initSqlJs from 'sql.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { DB_PATH, KLAIR_DIR } from '../shared/constants.js';
let SQL;
let db;
export async function initDatabase() {
    if (!existsSync(KLAIR_DIR)) {
        mkdirSync(KLAIR_DIR, { recursive: true });
    }
    SQL = await initSqlJs();
    if (existsSync(DB_PATH)) {
        const buffer = readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    }
    else {
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
function saveDb() {
    const data = db.export();
    writeFileSync(DB_PATH, Buffer.from(data));
}
export function getDb() {
    if (!db)
        throw new Error('Database not initialized. Call initDatabase() first.');
    return db;
}
// --- Query helpers ---
function execOne(sql, params) {
    return getDb().exec(sql, params)[0];
}
function mapRows(result, mapper) {
    if (!result)
        return [];
    const { columns, values } = result;
    return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return mapper(obj);
    });
}
function mapOne(result, mapper) {
    return mapRows(result, mapper)[0];
}
// --- Session operations ---
export function createSession(session) {
    getDb().run('INSERT INTO sessions (id, project_path, name, started_at, last_active_at, status) VALUES (?, ?, ?, ?, ?, ?)', [session.id, session.projectPath, session.name, session.startedAt, session.lastActiveAt, session.status]);
    saveDb();
}
export function getSession(id) {
    return mapOne(execOne('SELECT * FROM sessions WHERE id = ?', [id]), mapRowToSession);
}
export function getAllSessions() {
    return mapRows(execOne('SELECT * FROM sessions ORDER BY last_active_at DESC'), mapRowToSession);
}
export function getActiveSession() {
    return mapOne(execOne("SELECT * FROM sessions WHERE status = 'active' ORDER BY last_active_at DESC LIMIT 1"), mapRowToSession);
}
export function updateSessionStatus(id, status) {
    getDb().run('UPDATE sessions SET status = ?, last_active_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);
    saveDb();
}
export function clearSessionEvents(sessionId) {
    getDb().run('DELETE FROM diffs WHERE event_id IN (SELECT id FROM events WHERE session_id = ?)', [sessionId]);
    getDb().run('DELETE FROM events WHERE session_id = ?', [sessionId]);
    saveDb();
}
export function getSessionCount() {
    const result = execOne('SELECT COUNT(*) as count FROM sessions');
    return result?.values[0]?.[0] ?? 0;
}
export function getTotalEventCount() {
    const result = execOne('SELECT COUNT(*) as count FROM events');
    return result?.values[0]?.[0] ?? 0;
}
// --- Event operations ---
export function addEvent(event) {
    getDb().run('INSERT INTO events (id, session_id, file_path, event_type, timestamp, diff_id) VALUES (?, ?, ?, ?, ?, ?)', [event.id, event.sessionId, event.filePath, event.eventType, event.timestamp, event.diffId || null]);
    saveDb();
}
export function getEvents(sessionId, limit = 100) {
    return mapRows(execOne('SELECT * FROM events WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?', [sessionId, limit]), mapRowToFileEvent);
}
export function getEventCount(sessionId) {
    const result = execOne('SELECT COUNT(*) as count FROM events WHERE session_id = ?', [sessionId]);
    if (!result)
        return 0;
    return result.values[0]?.[0] ?? 0;
}
export function getEventById(id) {
    return mapOne(execOne('SELECT * FROM events WHERE id = ?', [id]), mapRowToFileEvent);
}
// --- Diff operations ---
export function addDiff(diff) {
    getDb().run('INSERT INTO diffs (id, event_id, content, file_path, lines_added, lines_removed) VALUES (?, ?, ?, ?, ?, ?)', [diff.id, diff.eventId, diff.content, diff.filePath, diff.linesAdded, diff.linesRemoved]);
    saveDb();
}
export function getDiffByEventId(eventId) {
    return mapOne(execOne('SELECT * FROM diffs WHERE event_id = ?', [eventId]), mapRowToDiff);
}
export function getDiffById(id) {
    return mapOne(execOne('SELECT * FROM diffs WHERE id = ?', [id]), mapRowToDiff);
}
// --- Settings operations ---
export function getSetting(key) {
    const result = execOne('SELECT value FROM settings WHERE key = ?', [key]);
    return result?.values[0]?.[0];
}
export function setSetting(key, value) {
    getDb().run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    saveDb();
}
export function getAllSettings() {
    const result = execOne('SELECT key, value FROM settings');
    if (!result)
        return {};
    const settings = {};
    for (const row of result.values) {
        settings[row[0]] = row[1];
    }
    return settings;
}
// --- Row mappers ---
function mapRowToSession(row) {
    return {
        id: row.id,
        projectPath: row.project_path,
        name: row.name,
        startedAt: row.started_at,
        lastActiveAt: row.last_active_at,
        status: row.status,
    };
}
function mapRowToFileEvent(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        filePath: row.file_path,
        eventType: row.event_type,
        timestamp: row.timestamp,
        diffId: row.diff_id || undefined,
    };
}
function mapRowToDiff(row) {
    return {
        id: row.id,
        eventId: row.event_id,
        content: row.content,
        filePath: row.file_path,
        linesAdded: row.lines_added,
        linesRemoved: row.lines_removed,
    };
}
//# sourceMappingURL=database.js.map