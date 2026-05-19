import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const KLAIR_DIR = path.join(os.homedir(), ".klair");
const PID_PATH = path.join(KLAIR_DIR, "camera.pid");
const STATE_PATH = path.join(KLAIR_DIR, "camera.state.json");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_SCRIPT = path.resolve(
  __dirname,
  "../../../daemon/bin/klair-daemon.js"
);

function readPid(): number | null {
  if (!fs.existsSync(PID_PATH)) return null;
  const pid = parseInt(fs.readFileSync(PID_PATH, "utf8"), 10);
  return Number.isFinite(pid) ? pid : null;
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function startDaemon(targetDir?: string): { pid: number; root: string } {
  const root = path.resolve(targetDir || process.cwd());

  if (!fs.existsSync(DAEMON_SCRIPT)) {
    throw new Error("Daemon not found. Reinstall klair-daemon.");
  }

  const child = spawn(process.execPath, [DAEMON_SCRIPT, root], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
    windowsHide: true,
  });
  child.unref();

  return { pid: child.pid!, root };
}

export function stopDaemon(): number | null {
  const pid = readPid();
  if (!pid) return null;
  if (!isRunning(pid)) {
    try {
      fs.unlinkSync(PID_PATH);
    } catch {
      /* already gone */
    }
    return null;
  }

  if (process.platform === "win32") {
    execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
  } else {
    process.kill(pid, "SIGTERM");
  }
  return pid;
}

export function resetSession(): void {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      } else {
        process.kill(pid, "SIGTERM");
      }
    } catch {
      /* already gone */
    }
  }

  for (const p of [
    path.join(KLAIR_DIR, "camera.db"),
    STATE_PATH,
  ]) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* already gone */
    }
  }
}
