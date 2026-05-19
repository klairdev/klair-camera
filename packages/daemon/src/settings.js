import fs from 'node:fs';
import path from 'node:path';
import { KLAIR_DIR, ensureKlairDir } from './paths.js';

export const SETTINGS_PATH = path.join(KLAIR_DIR, 'settings.json');

const DEFAULTS = {
  target: null,
  animate: true,
  streamOutput: true,
  verbose: false,
};

export function loadSettings() {
  ensureKlairDir();
  if (!fs.existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(patch) {
  ensureKlairDir();
  const next = { ...loadSettings(), ...patch };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
  return next;
}
