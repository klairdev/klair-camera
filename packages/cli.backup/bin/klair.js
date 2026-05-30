#!/usr/bin/env node

/**
 * KLAIR — Unified CLI entry point.
 *
 * Commands:
 *   klair watch [dir]  Start daemon + launch TUI
 *   klair stop          Stop running daemon
 *   klair status        Show daemon health
 *   klair see [n]       Open KLAIR Web GUI in browser
 *   klair init          Interactive setup
 *   klair help          Show help
 */

import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { spawn, spawnSync, execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));

const KLAIR_DIR = join(
  process.env.HOME || process.env.USERPROFILE || '~',
  '.klair'
);
const SETTINGS_PATH = join(KLAIR_DIR, 'settings.json');

// --- Color helpers ---

function dim(t) { return `\x1b[2m${t}\x1b[22m`; }
function red(t) { return `\x1b[38;5;124m${t}\x1b[39m`; }
function green(t) { return `\x1b[32m${t}\x1b[39m`; }
function yellow(t) { return `\x1b[33m${t}\x1b[39m`; }
function bold(t) { return `\x1b[1m${t}\x1b[22m`; }

const LOGO_LINES = [
  '█████████  ████     ████    ███████  ███████',
  '██     ██  ██  ██   ██  ██  ██       ██     ██',
  '██     ██  ██   ██  ██   ██ ██       ██     ██',
  '█████████  ██    ██ ██    ██ ███████  ███████',
  '██     ██  ██    ██ ██    ██       ██ ██',
  '██     ██  ██   ██  ██   ██       ██ ██',
  '██     ██  ██  ██   ██  ██  ███████  ██',
  '                                 ███████',
];

function printLogo() {
  console.log('');
  for (const line of LOGO_LINES) {
    console.log(red(line));
  }
  console.log(dim(`  klair v${pkg.version}  —  AI code observability`));
  console.log('');
}

function printHelp() {
  printLogo();
  console.log(bold('Usage:') + '  klair <command> [options]');
  console.log('');
  console.log(bold('Commands:'));
  console.log('  watch  [dir]    Start the camera (daemon + TUI)');
  console.log('  stop            Stop the running daemon');
  console.log('  status          Show daemon health & status');
  console.log('  see    [n]      Open KLAIR Web GUI in browser');
  console.log('  init            Interactive setup');
  console.log('  help            Show this help message');
  console.log('');
}

// --- Daemon lifecycle (imported from embedded lib) ---

async function importManager() {
  const mod = await import(pathToFileURL(resolve(rootDir, 'src/lib/daemon-manager.js')).href);
  return {
    spawnDaemon: mod.spawnDaemon,
    stopDaemon: mod.stopDaemon,
    getStatus: mod.getStatus,
    waitForDaemon: mod.waitForDaemon,
    readPid: mod.readPid,
    isRunning: mod.isRunning,
  };
}

// --- Browser ---

function openBrowser(url = 'http://localhost:3000') {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  execSync(cmd, { stdio: 'ignore' });
}

// --- Commands ---

async function cmdInit() {
  printLogo();
  console.log(bold(' Initializing KLAIR...'));
  console.log('');
  console.log(dim(' State directory: ' + KLAIR_DIR));
  console.log('');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((r) => rl.question(q, r));

  try {
    const target = await ask(dim(' Watch target directory [' + process.cwd() + ']: '));
    mkdirSync(KLAIR_DIR, { recursive: true });

    const existing = existsSync(SETTINGS_PATH)
      ? JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'))
      : {};
    const merged = {
      ...existing,
      target: target.trim() || process.cwd(),
      animate: true,
      verbose: false,
    };
    writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2));

    console.log('');
    console.log(green(' Settings saved'));
    console.log('');
    console.log(dim(' Next: run `klair watch` to start the camera'));
    console.log('');
  } finally {
    rl.close();
  }
}

async function cmdWatch(args) {
  printLogo();

  const mgr = await importManager();
  const watchDir = args[0] || process.cwd();

  // Start daemon
  console.log(dim(' Starting camera...'));
  try {
    const { pid, root } = mgr.spawnDaemon(watchDir);
    console.log(green(' Camera started'));
    console.log(dim(`  PID    ${pid}`));
    console.log(dim(`  Watch  ${root}`));
  } catch (err) {
    if (err.message?.includes('already running')) {
      console.log(yellow(' Camera is already running'));
    } else {
      console.error(red(' Failed to start daemon: ' + err.message));
      process.exit(1);
    }
  }

  // Wait for daemon to be ready
  const ready = await mgr.waitForDaemon(5000);
  if (!ready) {
    console.error(red(' Daemon did not respond in time.'));
    console.log(dim(' Try `klair status` to check.'));
    process.exit(1);
  }

  console.log(dim('  API    http://127.0.0.1:3928'));
  console.log('');

  // Launch TUI
  console.log(dim(' Launching terminal interface...'));
  console.log('');

  const tuiScript = resolve(rootDir, 'src/index.tsx');

  if (!existsSync(tuiScript)) {
    console.error(red(' TUI script not found: ' + tuiScript));
    console.log(dim(' Opening web GUI instead...'));
    openBrowser();
    return;
  }

  // Try bun first, fall back to tsx
  const useBun = (() => {
    try { execSync('bun --version', { stdio: 'ignore' }); return true; } catch { return false; }
  })();

  const child = useBun
    ? spawn('bun', ['run', tuiScript], { stdio: 'inherit', env: { ...process.env } })
    : spawn('npx', ['tsx', tuiScript], { stdio: 'inherit', env: { ...process.env }, shell: true });

  // Handle TUI exit
  child.on('exit', (code) => {
    console.log('');
    console.log(dim(' TUI exited.'));
    // Stop daemon on exit
    try { mgr.stopDaemon(); } catch { /* already stopped */ }
    console.log(green(' Camera shut down.'));
    console.log('');
    process.exit(code ?? 0);
  });

  // Forward signals to child
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

async function cmdStop() {
  const mgr = await importManager();
  try {
    const pid = mgr.stopDaemon();
    if (pid) {
      console.log(green(' Camera stopped'));
      console.log(dim(`  PID ${pid} terminated`));
    } else {
      console.log(yellow(' Camera is not running.'));
    }
  } catch (err) {
    console.error(red(' Error: ' + err.message));
    process.exit(1);
  }
}

async function cmdStatus() {
  const mgr = await importManager();
  const { running, pid, watchRoot, uptime } = mgr.getStatus();

  console.log('');
  console.log(bold('KLAIR Status'));
  console.log(`  Status    ${running ? green('active') : dim('stopped')}`);
  console.log(`  PID       ${running && pid ? pid : dim('\u2014')}`);
  if (watchRoot) console.log(`  Target    ${watchRoot}`);
  if (uptime !== null && uptime > 0) {
    const s = Math.floor(uptime / 1000);
    const m = Math.floor(s / 60);
    console.log(`  Uptime    ${m}m ${s % 60}s`);
  }
  console.log(`  API       http://127.0.0.1:3928`);
  console.log('');
}

async function cmdSee() {
  printLogo();
  console.log(dim('  Opening KLAIR Web GUI...'));
  console.log(dim('   http://localhost:3000'));
  console.log('');
  openBrowser();
}

// --- Main ---

async function main() {
  const cmd = process.argv[2] || 'help';
  const args = process.argv.slice(3);

  switch (cmd) {
    case 'init':
      await cmdInit();
      break;
    case 'watch':
      await cmdWatch(args);
      break;
    case 'stop':
      await cmdStop();
      break;
    case 'status':
      await cmdStatus();
      break;
    case 'see':
      await cmdSee();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case '--version':
    case '-v':
      printLogo();
      break;
    default:
      console.error(red(' Unknown command: ' + cmd));
      printHelp();
      process.exit(1);
  }
}

main();
