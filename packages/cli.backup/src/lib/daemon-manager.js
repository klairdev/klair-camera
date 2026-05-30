/**
 * Daemon Manager — lifecycle control for embedded klair-daemon.
 * Spawns daemon.js as a detached child process. Tracks PID.
 * Used by bin/klair.js and TUI hooks.
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const KLAIR_DIR = path.join(os.homedir(), '.klair');
const PID_PATH = path.join(KLAIR_DIR, 'camera.pid');
const STATE_PATH = path.join(KLAIR_DIR, 'camera.state.json');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_SCRIPT = path.resolve(__dirname, 'daemon/daemon.js');

/** Read the current daemon PID from disk */
export function readPid() {
  if (!fs.existsSync(PID_PATH)) return null;
  try {
    const pid = parseInt(fs.readFileSync(PID_PATH, 'utf8'), 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

/** Check if a process with the given PID is running */
export function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Get daemon status info */
export function getStatus() {
  const pid = readPid();
  const running = pid !== null && isRunning(pid);
  let watchRoot = null;
  let uptime = null;

  if (running && fs.existsSync(STATE_PATH)) {
    try {
      const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
      watchRoot = state.watchRoot ?? null;
      uptime = state.startedAt ? Date.now() - state.startedAt : null;
    } catch { /* stale state file */ }
  }

  return { running, pid, watchRoot, uptime };
}

/**
 * Spawn the daemon as a detached child process.
 * Silently runs in background - no console output.
 */
export function spawnDaemon(watchDir) {
  const root = path.resolve(watchDir || process.cwd());

  if (!fs.existsSync(DAEMON_SCRIPT)) {
    throw new Error('Daemon script not found: ' + DAEMON_SCRIPT);
  }

  // Check if already running
  const existing = readPid();
  if (existing && isRunning(existing)) {
    throw new Error('Camera is already running (pid ' + existing + ').');
  }

  const child = spawn(process.execPath, [DAEMON_SCRIPT, root], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
    windowsHide: true,
  });
  child.unref();

  return { pid: child.pid, root };
}

/**
 * Stop the daemon. Returns the killed PID or null if not running.
 */
export function stopDaemon() {
  const pid = readPid();
  if (!pid) return null;
  if (!isRunning(pid)) {
    try { fs.unlinkSync(PID_PATH); } catch { /* gone */ }
    return null;
  }

  if (process.platform === 'win32') {
    execSync('taskkill /F /PID ' + pid, { stdio: 'ignore' });
  } else {
    process.kill(pid, 'SIGTERM');
  }
  return pid;
}

/**
 * Poll the daemon health endpoint until it responds or timeout.
 * Returns true if daemon is ready, false if timeout.
 */
export async function waitForDaemon(timeoutMs) {
  const start = Date.now();
  const limit = timeoutMs || 5000;
  while (Date.now() - start < limit) {
    try {
      const res = await fetch('http://127.0.0.1:3928/health');
      if (res.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

export { KLAIR_DIR, PID_PATH, STATE_PATH };
