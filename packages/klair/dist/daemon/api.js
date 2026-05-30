import express from 'express';
import cors from 'cors';
import { getAllSessions, getSession, getActiveSession, createSession, getEvents, getEventCount, getEventById, getDiffByEventId, updateSessionStatus, clearSessionEvents, getSessionCount, getTotalEventCount, } from './database.js';
import { getSettings, updateSettings } from './settings.js';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
const startTime = Date.now();
export function startApi(port, onSettingsChanged, onRestartWatcher) {
    const app = express();
    app.use(cors());
    app.use(express.json());
    // ─── Status ────────────────────────────────────────────────
    app.get('/api/status', (_req, res) => {
        const sessions = getAllSessions();
        const activeSession = getActiveSession();
        res.json({
            success: true,
            data: {
                running: true,
                activeSession: activeSession || null,
                sessionCount: sessions.length,
            },
        });
    });
    // ─── Sessions ──────────────────────────────────────────────
    app.get('/api/sessions', (_req, res) => {
        const sessions = getAllSessions();
        res.json({ success: true, data: sessions });
    });
    app.get('/api/sessions/active', (_req, res) => {
        const session = getActiveSession();
        res.json({ success: true, data: session || null });
    });
    app.get('/api/sessions/:id', (req, res) => {
        const session = getSession(req.params.id);
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        res.json({ success: true, data: session });
    });
    app.post('/api/sessions', (req, res) => {
        const { projectPath, name } = req.body;
        if (!projectPath) {
            res.status(400).json({ success: false, error: 'projectPath is required' });
            return;
        }
        const now = new Date().toISOString();
        const session = {
            id: randomUUID(),
            projectPath,
            name: name || projectPath.split(/[/\\]/).pop() || projectPath,
            startedAt: now,
            lastActiveAt: now,
            status: 'active',
        };
        createSession(session);
        res.status(201).json({ success: true, data: session });
    });
    // ─── Events ────────────────────────────────────────────────
    app.get('/api/sessions/:id/events', (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 100;
        const events = getEvents(req.params.id, limit);
        res.json({ success: true, data: events });
    });
    app.get('/api/sessions/:id/stats', (req, res) => {
        const session = getSession(req.params.id);
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        const eventCount = getEventCount(req.params.id);
        const recentEvents = getEvents(req.params.id, 20);
        res.json({ success: true, data: { eventCount, recentEvents } });
    });
    // ─── Diffs ─────────────────────────────────────────────────
    app.get('/api/events/:eventId/diff', (req, res) => {
        const event = getEventById(req.params.eventId);
        if (!event) {
            res.status(404).json({ success: false, error: 'Event not found' });
            return;
        }
        const diff = getDiffByEventId(req.params.eventId);
        res.json({ success: true, data: diff || null });
    });
    // ─── Settings ──────────────────────────────────────────────
    app.get('/api/settings', (_req, res) => {
        const settings = getSettings();
        res.json({ success: true, data: settings });
    });
    app.put('/api/settings', async (req, res) => {
        // Persist to database
        updateSettings(req.body);
        const settings = getSettings();
        // Apply to running watcher (live reconfiguration)
        if (onSettingsChanged) {
            try {
                await onSettingsChanged(settings);
            }
            catch (err) {
                console.error('[api] Failed to apply settings to watcher:', err);
            }
        }
        res.json({ success: true, data: settings });
    });
    // ─── Session actions ────────────────────────────────────────
    app.get('/api/stats', (_req, res) => {
        const sessions = getSessionCount();
        const events = getTotalEventCount();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        res.json({ success: true, data: { sessions, events, uptime } });
    });
    app.get('/api/session', (_req, res) => {
        const session = getActiveSession();
        if (!session) {
            res.json({ success: true, data: null });
            return;
        }
        res.json({
            success: true,
            data: {
                id: session.id,
                name: session.name,
                path: session.projectPath,
                startTime: session.startedAt,
                status: session.status,
            },
        });
    });
    app.post('/api/session/restart', async (req, res) => {
        const { newPath } = req.body;
        if (!newPath || typeof newPath !== 'string') {
            res.status(400).json({ success: false, error: 'newPath is required' });
            return;
        }
        if (!existsSync(newPath)) {
            res.status(400).json({ success: false, error: `Path not found: ${newPath}` });
            return;
        }
        if (!onRestartWatcher) {
            res.status(500).json({ success: false, error: 'Watcher restart not available' });
            return;
        }
        try {
            const session = await onRestartWatcher(newPath);
            res.json({ success: true, data: { name: session.name, path: session.projectPath, startTime: session.startedAt } });
        }
        catch (err) {
            res.status(500).json({ success: false, error: 'Failed to restart watcher' });
        }
    });
    app.post('/api/sessions/stop', (_req, res) => {
        const session = getActiveSession();
        if (!session) {
            res.status(404).json({ success: false, error: 'No active session' });
            return;
        }
        updateSessionStatus(session.id, 'stopped');
        res.json({ success: true, data: { message: 'Session stopped' } });
    });
    app.post('/api/sessions/reset', (_req, res) => {
        const session = getActiveSession();
        if (!session) {
            res.status(404).json({ success: false, error: 'No active session' });
            return;
        }
        // Clear all events for this session
        clearSessionEvents(session.id);
        // Mark as active again (fresh start)
        updateSessionStatus(session.id, 'active');
        res.json({ success: true, data: { message: 'Session reset' } });
    });
    // ─── Dashboard ─────────────────────────────────────────────
    app.get('/api/dashboard', (_req, res) => {
        const sessions = getAllSessions();
        const activeSession = getActiveSession();
        const totalEvents = sessions.reduce((sum, s) => sum + getEventCount(s.id), 0);
        const recentEvents = activeSession ? getEvents(activeSession.id, 20) : [];
        const fileCounts = new Map();
        if (activeSession) {
            const allEvents = getEvents(activeSession.id, 1000);
            for (const event of allEvents) {
                fileCounts.set(event.filePath, (fileCounts.get(event.filePath) || 0) + 1);
            }
        }
        const topFiles = Array.from(fileCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([path, count]) => ({ path, count }));
        const stats = {
            totalSessions: sessions.length,
            totalEvents,
            activeSession: activeSession || null,
            recentEvents,
            topFiles,
        };
        res.json({ success: true, data: stats });
    });
    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
//# sourceMappingURL=api.js.map