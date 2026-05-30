import express from 'express';
import fs from 'node:fs';
import { getLastEvents, countEvents } from './database.js';
import { API_PORT, STATE_PATH, PID_PATH } from './paths.js';
import { loadSettings, saveSettings } from './settings.js';

export function createApi(db) {
  const app = express();
  app.disable('x-powered-by');

  // JSON body parsing (for PUT /settings)
  app.use(express.json());

  // CORS middleware (manual, no cors package)
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    if (_req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/status', (_req, res) => {
    try {
      const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
      let pid = null;
      try {
        pid = parseInt(fs.readFileSync(PID_PATH, 'utf8'), 10);
        pid = Number.isFinite(pid) ? pid : null;
      } catch { /* no pid file */ }
      const count = countEvents(db);
      res.json({
        ok: true,
        startedAt: state.startedAt,
        uptime: Date.now() - state.startedAt,
        watchRoot: state.watchRoot,
        pid,
        eventCount: count,
      });
    } catch {
      res.json({ ok: false, running: false });
    }
  });

  app.get('/settings', (_req, res) => {
    res.json(loadSettings());
  });

  app.put('/settings', (req, res) => {
    const updated = saveSettings(req.body || {});
    res.json(updated);
  });

  app.get('/events', (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 1000);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    res.json(getLastEvents(db, limit, offset));
  });

  return app;
}

export function listenApi(app, port = API_PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => resolve(server));
  });
}
