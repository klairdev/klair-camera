import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard, usePaste } from '@opentui/react';
import { decodePasteBytes } from '@opentui/core';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
const BUTTONS = [
    { id: 'start', label: 'Start Session', accent: COLORS.success, col: 0, row: 0 },
    { id: 'stop', label: 'Stop', accent: COLORS.error, col: 1, row: 0 },
    { id: 'reset', label: 'Reset', accent: COLORS.warning, col: 0, row: 1 },
    { id: 'changedir', label: 'Change Directory', accent: COLORS.info, col: 1, row: 1 },
];
function findButton(col, row) {
    return BUTTONS.findIndex((b) => b.col === col && b.row === row);
}
// ── Static time formatter (captured value, no re-render flicker) ─
function formatStaticTime(iso) {
    try {
        return new Date(iso).toLocaleString();
    }
    catch {
        return iso;
    }
}
// ── Component ────────────────────────────────────────────────
export function Dashboard() {
    const { dispatch } = useAppState();
    const api = useApi();
    const [focusedButton, setFocusedButton] = useState(0);
    const [toast, setToast] = useState(null);
    // Real data from daemon
    const [sessions, setSessions] = useState(0);
    const [events, setEvents] = useState(0);
    const [sessionName, setSessionName] = useState(null);
    const [sessionPath, setSessionPath] = useState(null);
    const [sessionStatus, setSessionStatus] = useState(null);
    // Top files and recent events from dashboard endpoint
    const [topFiles, setTopFiles] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    // Static start time — captured once, never re-rendered
    const [startTime, setStartTime] = useState(null);
    const [lastSessionId, setLastSessionId] = useState(null);
    // Directory input mode
    const [dirInputMode, setDirInputMode] = useState(false);
    const [dirInput, setDirInput] = useState('');
    // ── Poll daemon for live stats ─────────────────────────────
    useEffect(() => {
        const load = async () => {
            const stats = await api.getStats();
            if (stats) {
                setSessions(stats.sessions);
                setEvents(stats.events);
            }
            const session = await api.getSessionInfo();
            if (session) {
                setSessionName(session.name);
                setSessionPath(session.path);
                setSessionStatus(session.status);
                const sid = `${session.path}:${session.startTime}`;
                if (sid !== lastSessionId) {
                    setStartTime(session.startTime);
                    setLastSessionId(sid);
                }
            }
            else {
                setSessionName(null);
                setSessionPath(null);
                setSessionStatus(null);
                setStartTime(null);
                setLastSessionId(null);
            }
            // Load top files + recent events via dashboard endpoint
            const dash = await api.getDashboard();
            if (dash) {
                setTopFiles(dash.topFiles || []);
                setRecentEvents(dash.recentEvents || []);
            }
        };
        load();
        const interval = setInterval(load, 2000);
        return () => clearInterval(interval);
    }, [lastSessionId]);
    // ── Button actions ─────────────────────────────────────────
    const doAction = async (id) => {
        switch (id) {
            case 'start': {
                const active = await api.getActiveSession();
                if (active) {
                    setToast('Session already running');
                }
                else {
                    const result = await api.createSession(sessionPath || '.');
                    setToast(result ? 'Session started' : 'Failed to start session');
                }
                break;
            }
            case 'stop': {
                const result = await api.postStop();
                setToast(result ? 'Session stopped' : 'Failed to stop session');
                break;
            }
            case 'reset': {
                const result = await api.postReset();
                setToast(result ? 'Session reset' : 'Failed to reset session');
                break;
            }
            case 'changedir':
                setDirInputMode(true);
                setDirInput('');
                return;
        }
        setTimeout(() => setToast(null), 2500);
        refreshData();
    };
    const refreshData = async () => {
        const stats = await api.getStats();
        if (stats) {
            setSessions(stats.sessions);
            setEvents(stats.events);
        }
        const session = await api.getSessionInfo();
        if (session) {
            setSessionName(session.name);
            setSessionPath(session.path);
            setSessionStatus(session.status);
            const sid = `${session.path}:${session.startTime}`;
            if (sid !== lastSessionId) {
                setStartTime(session.startTime);
                setLastSessionId(sid);
            }
        }
        const dash = await api.getDashboard();
        if (dash) {
            setTopFiles(dash.topFiles || []);
            setRecentEvents(dash.recentEvents || []);
        }
    };
    // ── Keyboard handler ───────────────────────────────────────
    useKeyboard((key) => {
        // ── Directory input mode ──────────────────────────────
        if (dirInputMode) {
            if (key.name === 'escape') {
                setDirInputMode(false);
                setDirInput('');
                return;
            }
            if (key.name === 'enter' || key.name === 'return') {
                submitDirInput();
                return;
            }
            if (key.name === 'backspace') {
                setDirInput((prev) => prev.slice(0, -1));
                return;
            }
            if (key.name && key.name.length === 1) {
                setDirInput((prev) => prev + key.name);
            }
            return;
        }
        // ── Button grid navigation ────────────────────────────
        const btn = BUTTONS[focusedButton];
        let next;
        if (key.name === 'enter' || key.name === 'return') {
            doAction(btn.id);
            return;
        }
        if (key.name === 'up' || key.name === 'k') {
            next = findButton(btn.col, btn.row <= 0 ? 1 : btn.row - 1);
        }
        else if (key.name === 'down' || key.name === 'j') {
            next = findButton(btn.col, btn.row >= 1 ? 0 : btn.row + 1);
        }
        else if (key.name === 'left' || key.name === 'h') {
            next = findButton(btn.col <= 0 ? 1 : btn.col - 1, btn.row);
        }
        else if (key.name === 'right' || key.name === 'l') {
            next = findButton(btn.col >= 1 ? 0 : btn.col + 1, btn.row);
        }
        else {
            return;
        }
        if (next >= 0)
            setFocusedButton(next);
    });
    // ── Paste: handle pasted directory paths ────────────────────
    usePaste((event) => {
        if (!dirInputMode)
            return;
        const text = decodePasteBytes(event.bytes);
        if (text) {
            setDirInput((prev) => prev + text);
        }
    });
    // ── Submit directory change ─────────────────────────────────
    const submitDirInput = async () => {
        setDirInputMode(false);
        const path = dirInput.trim();
        if (!path) {
            setToast('No path entered');
            setTimeout(() => setToast(null), 2500);
            return;
        }
        const result = await api.postRestartSession(path);
        if (result) {
            setToast(`Watching: ${result.name}`);
            refreshData();
        }
        else {
            setToast('Failed — check path exists');
        }
        setTimeout(() => setToast(null), 2500);
        setDirInput('');
    };
    // ── Memoized static time ───────────────────────────────────
    const displayTime = useMemo(() => {
        return startTime ? formatStaticTime(startTime) : null;
    }, [startTime]);
    // ── Render ─────────────────────────────────────────────────
    return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Dashboard" }) }), _jsx("text", { fg: COLORS.textDim, children: "Real-time observability overview" }), _jsx("box", { style: { height: 1 } }), _jsxs("box", { style: { flexDirection: 'row', gap: 2 }, children: [_jsx(Card, { title: "Sessions", accent: COLORS.info, children: _jsx("text", { fg: COLORS.text, children: String(sessions) }) }), _jsx(Card, { title: "Events", accent: COLORS.success, children: _jsx("text", { fg: COLORS.text, children: String(events) }) }), _jsx(Card, { title: "Active Session", accent: COLORS.warning, children: _jsx("text", { fg: COLORS.text, children: sessionName || 'None' }) })] }), sessionName ? (_jsxs(Card, { title: "Active Session", accent: COLORS.primary, children: [_jsxs("text", { fg: COLORS.textMuted, children: ["Project: ", _jsx("span", { fg: COLORS.text, children: sessionPath })] }), displayTime ? (_jsxs("text", { fg: COLORS.textMuted, children: ["Started: ", _jsx("span", { fg: COLORS.text, children: displayTime })] })) : null, _jsxs("text", { fg: COLORS.textMuted, children: ["Status: ", _jsx("span", { fg: COLORS.success, children: sessionStatus })] })] })) : (_jsx(Card, { title: "No Active Session", accent: COLORS.textDim, children: _jsx("text", { fg: COLORS.textMuted, children: "Press Start Session to begin watching" }) })), _jsx("box", { style: { height: 1 } }), dirInputMode ? (_jsx(Card, { title: "Change Directory", accent: COLORS.warning, children: _jsxs("box", { style: { flexDirection: 'column' }, children: [_jsx("text", { fg: COLORS.textMuted, children: "Enter new project path:" }), _jsx("box", { style: { height: 1 } }), _jsxs("text", { fg: COLORS.text, children: [dirInput || '', _jsx("span", { fg: COLORS.primary, children: "_" })] }), _jsx("text", { fg: COLORS.textDim, children: "Enter: confirm | Esc: cancel" })] }) })) : (
            /* ── Action buttons ── */
            _jsx(Card, { title: "Actions", accent: COLORS.primary, children: _jsx("box", { style: { flexDirection: 'column', gap: 1 }, children: [0, 1].map((row) => (_jsx("box", { style: { flexDirection: 'row', gap: 2 }, children: BUTTONS.filter((b) => b.row === row).map((btn) => {
                            const idx = BUTTONS.indexOf(btn);
                            const focused = focusedButton === idx;
                            return (_jsx("box", { style: {
                                    border: true,
                                    borderColor: focused ? btn.accent : COLORS.border,
                                    backgroundColor: focused ? COLORS.surfaceHover : COLORS.surface,
                                    paddingLeft: 2,
                                    paddingRight: 2,
                                    height: 3,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexGrow: 1,
                                }, children: _jsx("text", { fg: focused ? btn.accent : COLORS.text, children: btn.label }) }, btn.id));
                        }) }, row))) }) })), _jsxs("text", { fg: toast ? COLORS.warning : COLORS.textDim, children: ['  ', toast || '↑↓←→: navigate | Enter: activate'] }), _jsx("box", { style: { height: 1 } }), topFiles.length > 0 ? (_jsx(Card, { title: "Top Changed Files", accent: COLORS.info, children: topFiles.slice(0, 5).map((file, i) => (_jsxs("box", { style: { flexDirection: 'row' }, children: [_jsxs("text", { fg: COLORS.textDim, children: [String(i + 1).padStart(2, ' '), ". "] }), _jsx("text", { fg: COLORS.text, children: file.path }), _jsx("box", { style: { flexGrow: 1 } }), _jsxs("text", { fg: COLORS.info, children: [String(file.count), " changes"] })] }, file.path))) })) : null, recentEvents.length > 0 ? (_jsx(Card, { title: "Recent Events", accent: COLORS.textMuted, children: recentEvents.slice(0, 8).map((event) => (_jsxs("box", { style: { flexDirection: 'row' }, children: [_jsx("text", { fg: event.eventType === 'created' ? COLORS.success :
                                event.eventType === 'deleted' ? COLORS.error :
                                    COLORS.warning, children: event.eventType === 'created' ? '+' : event.eventType === 'deleted' ? '-' : '~' }), _jsxs("text", { fg: COLORS.text, children: [" ", event.filePath] }), _jsx("box", { style: { flexGrow: 1 } }), _jsx("text", { fg: COLORS.textDim, children: new Date(event.timestamp).toLocaleTimeString() })] }, event.id))) })) : null] }));
}
//# sourceMappingURL=dashboard.js.map