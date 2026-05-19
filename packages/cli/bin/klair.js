#!/usr/bin/env node

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "..", "package.json"), "utf8")
);

const LOGO_LINES = [
  "█████████  ████     ████    ███████  ███████",
  "██     ██  ██  ██   ██  ██  ██       ██     ██",
  "██     ██  ██   ██  ██   ██ ██       ██     ██",
  "█████████  ██    ██ ██    ██ ███████  ███████",
  "██     ██  ██    ██ ██    ██       ██ ██",
  "██     ██  ██   ██  ██   ██       ██ ██",
  "██     ██  ██  ██   ██  ██  ███████  ██",
  "                                 ███████",
];

const KLAIR_DIR = join(
  process.env.HOME || process.env.USERPROFILE || "~",
  ".klair"
);
const DAEMON_DIR = join(KLAIR_DIR, "daemon");
const DAEMON_PKG_DIR = join(DAEMON_DIR, "node_modules", "klair-daemon");
const DAEMON_CLI = join(DAEMON_PKG_DIR, "bin", "klair-daemon.js");

function dim(t) {
  return `\x1b[2m${t}\x1b[22m`;
}
function red(t) {
  return `\x1b[38;5;124m${t}\x1b[39m`;
}
function green(t) {
  return `\x1b[32m${t}\x1b[39m`;
}
function yellow(t) {
  return `\x1b[33m${t}\x1b[39m`;
}
function bold(t) {
  return `\x1b[1m${t}\x1b[22m`;
}

function printLogo() {
  console.log("");
  for (const line of LOGO_LINES) {
    console.log(red(line));
  }
  console.log(dim(`  klair v${pkg.version}  —  AI code observability`));
  console.log("");
}

function printHelp() {
  printLogo();
  console.log(bold("Usage:") + "  klair <command> [options]");
  console.log("");
  console.log(bold("Commands:"));
  console.log("  init            Install daemon and configure settings");
  console.log("  watch  [dir]    Start the file watcher daemon");
  console.log("  see    [n]      Show recent file change events");
  console.log("  stop            Stop the running daemon");
  console.log("  help            Show this help message");
  console.log("");
}

function isDaemonInstalled() {
  return existsSync(DAEMON_CLI);
}

function installDaemon() {
  console.log(yellow(" Installing klair-daemon..."));
  mkdirSync(DAEMON_DIR, { recursive: true });
  const result = spawnSync(
    "npm",
    ["install", "klair-daemon", "--prefix", DAEMON_DIR, "--no-audit", "--no-fund"],
    {
      stdio: "inherit",
      shell: true,
      env: { ...process.env },
    }
  );
  if (result.status !== 0) {
    console.error(red(" Failed to install klair-daemon."));
    process.exit(1);
  }
  console.log(green(" klair-daemon installed"));
}

function ensureDaemon() {
  if (!isDaemonInstalled()) {
    console.log(yellow(" Daemon not found at " + DAEMON_CLI));
    installDaemon();
  }
}

function delegateToDaemon(args) {
  ensureDaemon();
  const result = spawnSync(process.execPath, [DAEMON_CLI, ...args], {
    stdio: "inherit",
    env: { ...process.env },
  });
  process.exit(result.status ?? 0);
}

async function cmdInit() {
  printLogo();
  console.log(bold(" Initializing KLAIR..."));
  console.log("");

  if (!isDaemonInstalled()) {
    console.log(dim(" Daemon will be installed to:"));
    console.log(dim("   " + DAEMON_DIR));
    console.log("");
    installDaemon();
    console.log("");
  } else {
    console.log(green(" Daemon already installed"));
    console.log("");
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((r) => rl.question(q, r));

  try {
    const target = await ask(dim(" Watch target directory [" + process.cwd() + "]: "));

    mkdirSync(KLAIR_DIR, { recursive: true });
    const settingsPath = join(KLAIR_DIR, "settings.json");
    const existing = existsSync(settingsPath)
      ? JSON.parse(readFileSync(settingsPath, "utf8"))
      : {};
    const merged = {
      ...existing,
      target: target.trim() || process.cwd(),
      animate: true,
      verbose: false,
    };
    writeFileSync(settingsPath, JSON.stringify(merged, null, 2));

    console.log(green(" Settings saved"));
    console.log("");
    console.log(dim(" Next: run `klair watch` to start the camera"));
    console.log("");
  } finally {
    rl.close();
  }
}

function cmdWatch(args) {
  printLogo();
  ensureDaemon();
  delegateToDaemon(["start", ...args]);
}

function cmdSee(args) {
  delegateToDaemon(["events", ...args]);
}

function cmdStop() {
  delegateToDaemon(["stop"]);
}

async function main() {
  const cmd = process.argv[2] || "help";
  const args = process.argv.slice(3);

  switch (cmd) {
    case "init":
      await cmdInit();
      break;
    case "watch":
      cmdWatch(args);
      break;
    case "see":
      cmdSee(args);
      break;
    case "stop":
      cmdStop();
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    case "--version":
    case "-v":
      printLogo();
      break;
    default:
      console.error(red(" Unknown command: " + cmd));
      printHelp();
      process.exit(1);
  }
}

main();
