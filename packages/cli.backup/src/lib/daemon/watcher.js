import chokidar from 'chokidar';
import path from 'node:path';
import { insertEvent } from './database.js';
import { getGitDiff } from './git.js';

const IGNORED = [
  /(^|[/\\])node_modules([/\\]|$)/,
  /(^|[/\\])\.git([/\\]|$)/,
  /(^|[/\\])dist([/\\]|$)/,
];

const CHOKIDAR_OPTS = {
  ignored: IGNORED,
  ignoreInitial: true,
  ignorePermissionErrors: true,
  usePolling: false,
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 50,
  },
};

function toRelative(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

export function createWatcher({ root, db, onEvent, onCapturing }) {
  const pending = new Map();

  const flush = async (relPath, eventType) => {
    const key = `${eventType}:${relPath}`;
    if (pending.has(key)) return;
    pending.set(key, true);

    try {
      await onCapturing?.({ file: relPath, eventType });
      const gitDiff =
        eventType === 'unlink' ? '' : await getGitDiff(root, relPath);
      const row = insertEvent(db, {
        timestamp: Date.now(),
        file: relPath,
        eventType,
        gitDiff,
      });
      onEvent?.({ file: relPath, eventType, id: row.lastInsertRowid ?? row.lastInsertRowId });
    } catch (err) {
      console.error(`[klair-camera] failed to process ${eventType} ${relPath}:`, err.message);
    } finally {
      pending.delete(key);
    }
  };

  const watcher = chokidar.watch(root, CHOKIDAR_OPTS);

  watcher.on('add', (p) => flush(toRelative(root, p), 'add'));
  watcher.on('change', (p) => flush(toRelative(root, p), 'change'));
  watcher.on('unlink', (p) => flush(toRelative(root, p), 'unlink'));

  watcher.on('error', (err) => {
    console.error('[klair-camera] watcher error:', err.message);
  });

  return watcher;
}
