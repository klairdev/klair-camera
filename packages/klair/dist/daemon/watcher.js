import chokidar from 'chokidar';
import { addDiff, addEvent, createSession, updateSessionStatus } from './database.js';
import { captureDiff } from './git.js';
import { getSettings } from './settings.js';
import { randomUUID } from 'node:crypto';
// ── Active watcher state (for live reconfiguration) ──────────
let activeWatcher = null;
let activeSession = null;
let activeProjectPath = null;
// ── Start ───────────────────────────────────────────────────
export async function startWatcher(projectPath) {
    activeProjectPath = projectPath;
    // Create session (only if none active for this path)
    if (!activeSession || activeSession.projectPath !== projectPath) {
        const settings = getSettings();
        const now = new Date().toISOString();
        activeSession = {
            id: randomUUID(),
            projectPath,
            name: projectPath.split(/[/\\]/).pop() || projectPath,
            startedAt: now,
            lastActiveAt: now,
            status: 'active',
        };
        createSession(activeSession);
    }
    activeWatcher = buildWatcher(projectPath, activeSession);
    return { session: activeSession, watcher: activeWatcher };
}
// ── Live reconfiguration ────────────────────────────────────
export async function applySettings(_newSettings) {
    if (!activeWatcher || !activeSession || !activeProjectPath)
        return;
    await activeWatcher.close();
    activeWatcher = null;
    activeWatcher = buildWatcher(activeProjectPath, activeSession);
}
export async function restartWatcher(newPath) {
    // Close existing watcher
    if (activeWatcher) {
        await activeWatcher.close();
        activeWatcher = null;
    }
    // Mark old session as stopped
    if (activeSession) {
        updateSessionStatus(activeSession.id, 'stopped');
    }
    // Start fresh on new path
    const result = await startWatcher(newPath);
    return result.session;
}
// ── Watcher factory ─────────────────────────────────────────
function buildWatcher(projectPath, session) {
    const settings = getSettings();
    // Debounce tracking (per-watcher instance)
    const debounceTimers = new Map();
    const pendingEvents = new Map();
    function flushEvent(key) {
        const pending = pendingEvents.get(key);
        if (!pending)
            return;
        pendingEvents.delete(key);
        debounceTimers.delete(key);
        const eventId = randomUUID();
        const fileEvent = {
            id: eventId,
            sessionId: session.id,
            filePath: pending.filePath,
            eventType: pending.eventType,
            timestamp: new Date().toISOString(),
        };
        if (pending.eventType === 'modified') {
            captureDiff(projectPath, pending.filePath)
                .then((diff) => {
                if (diff.content) {
                    fileEvent.diffId = diff.id;
                    addEvent(fileEvent);
                    addDiff({ ...diff, eventId });
                }
                else {
                    addEvent(fileEvent);
                }
            })
                .catch(() => {
                addEvent(fileEvent);
            });
        }
        else {
            addEvent(fileEvent);
        }
        updateSessionStatus(session.id, 'active');
    }
    // Convert ignore patterns to regex
    const ignoredPatterns = [
        /(^|[/\\])\./,
        ...settings.ignorePatterns.map((p) => {
            const escaped = p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
            return new RegExp(escaped);
        }),
    ];
    const watcher = chokidar.watch(projectPath, {
        ignored: ignoredPatterns,
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: settings.watchDebounceMs,
            pollInterval: 100,
        },
    });
    function handleChange(filePath, eventType) {
        const relativePath = filePath.replace(projectPath, '').replace(/^[/\\]/, '');
        const key = `${relativePath}:${eventType}`;
        pendingEvents.set(key, { filePath: relativePath, eventType });
        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }
        debounceTimers.set(key, setTimeout(() => flushEvent(key), settings.watchDebounceMs));
    }
    watcher.on('add', (path) => handleChange(path, 'created'));
    watcher.on('change', (path) => handleChange(path, 'modified'));
    watcher.on('unlink', (path) => handleChange(path, 'deleted'));
    watcher.on('error', (error) => {
        console.error('[watcher] Error:', error);
    });
    return watcher;
}
//# sourceMappingURL=watcher.js.map