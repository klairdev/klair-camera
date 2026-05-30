import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const KLAIR_DIR = path.join(os.homedir(), '.klair');
export const DB_PATH = path.join(KLAIR_DIR, 'camera.db');
export const PID_PATH = path.join(KLAIR_DIR, 'camera.pid');
export const STATE_PATH = path.join(KLAIR_DIR, 'camera.state.json');
export const API_PORT = 3928;

export function ensureKlairDir() {
  fs.mkdirSync(KLAIR_DIR, { recursive: true });
}
