import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApi, listenApi } from './api.js';
import { openDatabase } from './database.js';
import { API_PORT, PID_PATH, STATE_PATH, ensureKlairDir } from './paths.js';
import { createWatcher } from './watcher.js';
import { phraseRandom } from './ui/phrases.js';
import { paint } from './ui/theme.js';

export async function runDaemon(watchRoot) {
  const root = path.resolve(watchRoot);
  ensureKlairDir();

  fs.writeFileSync(
    STATE_PATH,
    JSON.stringify({ watchRoot: root, startedAt: Date.now() }, null, 2)
  );
  fs.writeFileSync(PID_PATH, String(process.pid));

  const db = openDatabase();
  const app = createApi(db);
  await listenApi(app, API_PORT);

  const watcher = createWatcher({
    root,
    db,
    onEvent({ file, eventType }) {
      if (process.env.KLAIR_VERBOSE) {
        console.log(paint.dim(`  ${eventType}  ${file}`));
      }
    },
  });

  const shutdown = () => {
    watcher.close();
    db.close();
    try {
      fs.unlinkSync(PID_PATH);
    } catch {
      /* gone */
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('beforeExit', shutdown);

  if (process.env.KLAIR_VERBOSE) {
    console.log('');
    console.log(paint.muted(phraseRandom('success')));
    console.log(paint.dim(`Watching ${root}`));
    console.log(paint.dim(`API :${API_PORT}`));
    console.log('');
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  const root = process.argv[2] || process.cwd();
  await runDaemon(root);
}
