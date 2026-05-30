import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { setSetting, getAllSettings as dbGetAllSettings } from './database.js';
import { DEFAULT_SETTINGS, KLAIR_DIR } from '../shared/constants.js';
const SETTINGS_FILE = `${KLAIR_DIR}/settings.json`;
// ── Init ─────────────────────────────────────────────────────
export async function initSettings() {
    // Ensure directory exists
    if (!existsSync(KLAIR_DIR)) {
        mkdirSync(KLAIR_DIR, { recursive: true });
    }
    // Try loading from JSON file first (persistent across DB resets)
    let fileSettings = null;
    if (existsSync(SETTINGS_FILE)) {
        try {
            fileSettings = JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
        }
        catch {
            // Corrupt file — fall through to defaults
        }
    }
    const existing = dbGetAllSettings();
    // Merge: file settings > defaults, write to DB if missing
    const source = fileSettings ?? DEFAULT_SETTINGS;
    for (const [key, value] of Object.entries(source)) {
        if (!(key in existing)) {
            const strValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
            setSetting(key, strValue);
        }
    }
    // Ensure DB has defaults for any keys not in file or DB
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!(key in existing)) {
            const strValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
            setSetting(key, strValue);
        }
    }
    // Sync to JSON file
    saveSettingsFile();
}
// ── Read ─────────────────────────────────────────────────────
export function getSettings() {
    const raw = dbGetAllSettings();
    return {
        watchDebounceMs: parseInt(raw.watchDebounceMs || String(DEFAULT_SETTINGS.watchDebounceMs), 10),
        maxEventsPerSession: parseInt(raw.maxEventsPerSession || String(DEFAULT_SETTINGS.maxEventsPerSession), 10),
        ignorePatterns: raw.ignorePatterns ? JSON.parse(raw.ignorePatterns) : DEFAULT_SETTINGS.ignorePatterns,
        theme: raw.theme || DEFAULT_SETTINGS.theme,
        autoStart: raw.autoStart !== undefined ? raw.autoStart === 'true' : DEFAULT_SETTINGS.autoStart,
    };
}
// ── Write ────────────────────────────────────────────────────
export function updateSettings(partial) {
    for (const [key, value] of Object.entries(partial)) {
        if (value === undefined)
            continue;
        const strValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
        setSetting(key, strValue);
    }
    // Sync to JSON file after every update
    saveSettingsFile();
}
export function resetSettings() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        const strValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
        setSetting(key, strValue);
    }
    saveSettingsFile();
}
// ── JSON file persistence ────────────────────────────────────
function saveSettingsFile() {
    const settings = getSettings();
    try {
        writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    }
    catch (err) {
        console.error('[settings] Failed to write settings.json:', err);
    }
}
//# sourceMappingURL=settings.js.map