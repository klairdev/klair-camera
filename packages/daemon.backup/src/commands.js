import { spawn, execSync } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLastEvents, openDatabase } from './database.js';
import { DB_PATH, PID_PATH, STATE_PATH, ensureKlairDir } from './paths.js';
import { loadSettings, saveSettings } from './settings.js';
import { box } from './ui/layout.js';
import { phraseRandom } from './ui/phrases.js';
import { paint } from './ui/theme.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_SCRIPT = path.join(__dirname, 'daemon.js');

export function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function readPid() {
  if (!fs.existsSync(PID_PATH)) return null;
  const pid = parseInt(fs.readFileSync(PID_PATH, 'utf8'), 10);
  return Number.isFinite(pid) ? pid : null;
}

export function readState() {
  if (!fs.existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

export function getTarget() {
  const s = loadSettings();
  if (s.target && fs.existsSync(s.target)) return s.target;
  const state = readState();
  if (state?.watchRoot && fs.existsSync(state.watchRoot)) return state.watchRoot;
  return process.cwd();
}

export function setTarget(dir) {
  const root = path.resolve(dir);
  if (!fs.existsSync(root)) {
    throw new Error(phraseRandom('error', "That path doesn't exist."));
  }
  saveSettings({ target: root });
  return root;
}

export function startDaemon(watchDir) {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    throw new Error(`Camera is already running (pid ${pid}).`);
  }

  if (!fs.existsSync(DAEMON_SCRIPT)) {
    throw new Error('Daemon not found. Reinstall klair-daemon.');
  }

  const root = path.resolve(watchDir || getTarget());
  if (!fs.existsSync(root)) {
    throw new Error(phraseRandom('error', "That path doesn't exist."));
  }

  saveSettings({ target: root });

  const child = spawn(process.execPath, [DAEMON_SCRIPT, root], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
    windowsHide: true,
  });
  child.unref();
  return { pid: child.pid, root };
}

export function stopDaemon() {
  const pid = readPid();
  if (!pid) throw new Error('Camera is not running.');
  if (!isRunning(pid)) {
    fs.unlinkSync(PID_PATH);
    throw new Error('Removed a stale session file.');
  }
  if (process.platform === 'win32') {
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
  } else {
    process.kill(pid, 'SIGTERM');
  }
  return pid;
}

export function resetSession() {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } else {
        process.kill(pid, 'SIGTERM');
      }
    } catch {
      /* already gone */
    }
  }

  const toDelete = [DB_PATH, STATE_PATH];
  for (const p of toDelete) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* already gone */
    }
  }
}

export async function configInteractive() {
  const settings = loadSettings();
  const current = getTarget();

  console.log('');
  const rows = [
    `target         ${current}`,
    `animate        ${settings.animate ? 'on' : 'off'}`,
    `verbose        ${settings.verbose ? 'on' : 'off'}`,
  ];
  for (const line of box('Current Settings', rows)) {
    console.log(line);
  }
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    const target = await ask(
      paint.muted(`Target directory [${current}]: `)
    );
    if (target.trim()) {
      setTarget(target.trim());
    }

    const animate = await ask(
      paint.muted(`Animate [${settings.animate ? 'on' : 'off'}]: `)
    );
    if (animate.trim()) {
      saveSettings({ animate: animate.trim().toLowerCase() === 'on' });
    }

    const verbose = await ask(
      paint.muted(`Verbose [${settings.verbose ? 'on' : 'off'}]: `)
    );
    if (verbose.trim()) {
      saveSettings({ verbose: verbose.trim().toLowerCase() === 'on' });
    }
  } finally {
    rl.close();
  }

  console.log(paint.muted('Updated.'));
  console.log('');
}

export function fetchEvents(n = 10) {
  ensureKlairDir();
  const db = openDatabase();
  const events = getLastEvents(db, n);
  db.close();
  return events;
}

export function formatStatus() {
  const pid = readPid();
  const running = pid && isRunning(pid);
  const state = readState();
  const settings = loadSettings();
  const target = getTarget();

  return box('Session', [
    `Status     ${running ? paint.success('active') : paint.muted('stopped')}`,
    `PID        ${running ? pid : '—'}`,
    `Target     ${target}`,
    `API        http://127.0.0.1:3928`,
    `Animate    ${settings.animate ? 'on' : 'off'}`,
    `Verbose    ${settings.verbose ? 'on' : 'off'}`,
  ]);
}
