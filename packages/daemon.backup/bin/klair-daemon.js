#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  startDaemon,
  stopDaemon,
  resetSession,
  configInteractive,
  fetchEvents,
  formatStatus,
  readPid,
  isRunning,
  getTarget,
} from "../src/commands.js";
import { printBanner } from "../src/banner.js";
import { ensureKlairDir } from "../src/paths.js";
import { loadSettings } from "../src/settings.js";

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

function dim(text) {
  return `\x1b[2m${text}\x1b[22m`;
}
function red(text) {
  return `\x1b[38;5;124m${text}\x1b[39m`;
}
function green(text) {
  return `\x1b[32m${text}\x1b[39m`;
}
function yellow(text) {
  return `\x1b[33m${text}\x1b[39m`;
}
function bold(text) {
  return `\x1b[1m${text}\x1b[22m`;
}

function printLogo() {
  console.log("");
  for (const line of LOGO_LINES) {
    console.log(red(line));
  }
  console.log("");
}

function printVersion() {
  console.log(dim(`klair-daemon v${pkg.version}`));
  console.log("");
}

function printHelp() {
  printLogo();
  console.log(bold("Usage:") + "  klair-daemon <command> [options]");
  console.log("");
  console.log(bold("Commands:"));
  console.log("  start  [dir]   Start the file watcher daemon");
  console.log("  stop            Stop the running daemon");
  console.log("  status          Show daemon status");
  console.log("  config          Interactive configuration");
  console.log("  reset           Reset session (clear events)");
  console.log("  events [n]      Show recent file change events");
  console.log("  help            Show this help message");
  console.log("");
}

async function cmdStart(args) {
  const target = args[0] || getTarget();
  try {
    const { pid, root } = startDaemon(target);
    console.log(green(" Camera started"));
    console.log(dim(` PID    ${pid}`));
    console.log(dim(` Watch  ${root}`));
    console.log(dim(` API    http://127.0.0.1:3928`));
    console.log("");
  } catch (err) {
    console.error(red(" Error: " + err.message));
    process.exit(1);
  }
}

function cmdStop() {
  try {
    const pid = stopDaemon();
    console.log(green(" Camera stopped"));
    console.log(dim(` PID ${pid} terminated`));
    console.log("");
  } catch (err) {
    console.error(red(" Error: " + err.message));
    process.exit(1);
  }
}

function cmdStatus() {
  const lines = formatStatus();
  console.log("");
  for (const line of lines) {
    console.log(line);
  }
  console.log("");
}

async function cmdConfig() {
  await configInteractive();
}

async function cmdReset() {
  console.log(yellow(" Resetting session..."));
  resetSession();
  console.log(green(" Done. Events cleared."));
  console.log("");
}

function cmdEvents(args) {
  const n = parseInt(args[0], 10) || 10;
  ensureKlairDir();
  const events = fetchEvents(n);
  if (events.length === 0) {
    console.log(dim(" No events recorded yet."));
    console.log("");
    return;
  }
  console.log("");
  for (const ev of events) {
    const ts = new Date(ev.timestamp).toLocaleString();
    const label = ev.eventType === "change" ? yellow(ev.eventType) : dim(ev.eventType);
    console.log(`  ${dim(ts)}  ${label}  ${ev.file}`);
  }
  console.log("");
}

async function main() {
  const cmd = process.argv[2] || "help";
  const args = process.argv.slice(3);

  switch (cmd) {
    case "start":
      await printBanner({ compact: false });
      printVersion();
      await cmdStart(args);
      break;
    case "stop":
      cmdStop();
      break;
    case "status":
      cmdStatus();
      break;
    case "config":
      await printBanner({ compact: false });
      await cmdConfig();
      break;
    case "reset":
      await cmdReset();
      break;
    case "events":
      cmdEvents(args);
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    case "--version":
    case "-v":
      printVersion();
      break;
    default:
      console.error(red(" Unknown command: " + cmd));
      console.log("");
      console.log(dim(" Run `klair-daemon help` for usage."));
      console.log("");
      process.exit(1);
  }
}

main();
