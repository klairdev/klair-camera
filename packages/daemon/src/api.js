import express from 'express';
import { getLastEvents } from './database.js';
import { API_PORT } from './paths.js';

export function createApi(db) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/events', (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    res.json(getLastEvents(db, limit));
  });

  return app;
}

export function listenApi(app, port = API_PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => resolve(server));
  });
}
