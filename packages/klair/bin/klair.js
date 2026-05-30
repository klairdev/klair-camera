#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DAEMON_PORT = 4200;
const KLAIR_ROOT = resolve(__dirname, '..');

function printBanner() {
  console.log(`
  \x1b[31m██╗  ██╗██╗      █████╗ ██╗██████╗ \x1b[0m
  \x1b[31m██║ ██╔╝██║     ██╔══██╗██║██╔══██╗\x1b[0m
  \x1b[31m█████╔╝ ██║     ███████║██║██████╔╝\x1b[0m
  \x1b[31m██╔═██╗ ██║     ██╔══██║██║██╔══██╗\x1b[0m
  \x1b[31m██║  ██╗███████╗██║  ██║██║██║  ██║\x1b[0m
  \x1b[31m╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝\x1b[0m

  \x1b[90mObserving the Agent Era\x1b[0m
  `);
}

function printUsage() {
  console.log(`
Usage: klair <command> [options]

Commands:
  run <path>     Start watching a project and open the TUI
  daemon <path>  Start only the daemon in the background
  watch <path>   Alias for "run"
  --help, -h     Show this help
  --version, -v  Show version

Examples:
  klair run ~/my-project
  klair watch .
  klair daemon ~/my-project
`);
}

function isBunAvailable() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function startDaemon(projectPath) {
  const daemonScript = resolve(KLAIR_ROOT, 'dist', 'daemon', 'index.js');

  if (!existsSync(daemonScript)) {
    console.error('[klair] Daemon not built. Run: npm run build');
    process.exit(1);
  }

  const child = spawn('node', [daemonScript], {
    stdio: 'pipe',
    env: {
      ...process.env,
      KLAIR_PROJECT_PATH: resolve(projectPath),
      KLAIR_DAEMON_PORT: String(DAEMON_PORT),
    },
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[daemon] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[daemon:err] ${data}`);
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[klair] Daemon exited with code ${code}`);
    }
  });

  return child;
}

function startTUI() {
  if (!isBunAvailable()) {
    console.error('[klair] Bun is required to run the TUI. Install: https://bun.sh');
    console.error('[klair] The daemon is still running. You can interact via the API at http://localhost:' + DAEMON_PORT);
    return;
  }

  const tuiEntry = resolve(KLAIR_ROOT, 'src', 'cli', 'index.tsx');

  const child = spawn('bun', ['run', tuiEntry], {
    stdio: 'inherit',
    env: {
      ...process.env,
      KLAIR_DAEMON_PORT: String(DAEMON_PORT),
    },
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const pkgPath = resolve(KLAIR_ROOT, 'package.json');
    const pkg = JSON.parse(await import('fs').then(fs => fs.readFileSync(pkgPath, 'utf-8')));
    console.log(`klair v${pkg.version}`);
    process.exit(0);
  }

  const command = args[0];
  const projectPath = args[1] || process.cwd();

  if (command === 'run' || command === 'watch') {
    printBanner();

    console.log(`\n[klair] Starting daemon for: ${resolve(projectPath)}`);
    const daemon = startDaemon(resolve(projectPath));

    // Give daemon a moment to start
    await new Promise(r => setTimeout(r, 1000));

    console.log('[klair] Launching TUI...\n');
    startTUI();

    // Cleanup on exit
    const cleanup = () => {
      daemon.kill('SIGTERM');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } else if (command === 'daemon') {
    console.log(`[klair] Starting daemon for: ${resolve(projectPath)}`);
    const daemon = startDaemon(resolve(projectPath));

    process.on('SIGINT', () => {
      daemon.kill('SIGTERM');
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      daemon.kill('SIGTERM');
      process.exit(0);
    });

  } else {
    console.error(`[klair] Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[klair] Fatal error:', err.message);
  process.exit(1);
});
