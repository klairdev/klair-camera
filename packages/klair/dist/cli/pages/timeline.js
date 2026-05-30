import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
const EVENTS_PER_PAGE = 20;
const POLL_MS = 2000;
export function Timeline() {
    const { dispatch } = useAppState();
    const api = useApi();
    // Self-sufficient state — not dependent on app store
    const [events, setEvents] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [sessionName, setSessionName] = useState(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Track last event count to detect new events
    const lastCountRef = useRef(0);
    // ── Poll daemon for events ─────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            // Step 1: get active session (try /api/session first)
            let session = await api.getSessionInfo();
            // Fallback: try /api/sessions/active if /api/session returns null
            if (!session) {
                const active = await api.getActiveSession();
                if (active && !cancelled) {
                    session = {
                        id: active.id,
                        name: active.name,
                        path: active.projectPath,
                        startTime: active.startedAt,
                        status: active.status,
                    };
                }
            }
            if (!session) {
                if (!cancelled) {
                    setEvents([]);
                    setSessionId(null);
                    setSessionName(null);
                    setLoading(false);
                    setError('No active session. Start one from Dashboard.');
                }
                return;
            }
            if (!cancelled) {
                setSessionId(session.id);
                setSessionName(session.name);
                setError(null);
            }
            // Step 2: get events for this session
            const fetched = await api.getEvents(session.id, 200);
            if (cancelled)
                return;
            if (fetched) {
                setEvents(fetched);
                if (fetched.length > lastCountRef.current && lastCountRef.current > 0) {
                    setScrollOffset(0);
                    setSelectedIndex(0);
                }
                lastCountRef.current = fetched.length;
            }
            setLoading(false);
        };
        load(); // initial fetch
        const interval = setInterval(load, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);
    // ── Keyboard: scroll + select ──────────────────────────────
    const maxScroll = Math.max(0, events.length - EVENTS_PER_PAGE);
    useKeyboard((key) => {
        if (events.length === 0)
            return;
        if (key.name === 'up' || key.name === 'k') {
            setSelectedIndex((prev) => {
                const next = Math.max(0, prev - 1);
                if (next < scrollOffset)
                    setScrollOffset(next);
                return next;
            });
        }
        if (key.name === 'down' || key.name === 'j') {
            setSelectedIndex((prev) => {
                const next = Math.min(events.length - 1, prev + 1);
                if (next >= scrollOffset + EVENTS_PER_PAGE) {
                    setScrollOffset(Math.min(maxScroll, next - EVENTS_PER_PAGE + 1));
                }
                return next;
            });
        }
        if (key.name === 'enter' || key.name === 'return') {
            const event = events[selectedIndex];
            if (event) {
                dispatch({ type: 'SELECT_EVENT', eventId: event.id });
                dispatch({ type: 'SET_PAGE', page: 'diff-viewer' });
            }
        }
        if (key.name === 'pageup') {
            setScrollOffset((prev) => Math.max(0, prev - EVENTS_PER_PAGE));
            setSelectedIndex((prev) => Math.max(0, prev - EVENTS_PER_PAGE));
        }
        if (key.name === 'pagedown') {
            setScrollOffset((prev) => Math.min(maxScroll, prev + EVENTS_PER_PAGE));
            setSelectedIndex((prev) => Math.min(events.length - 1, prev + EVENTS_PER_PAGE));
        }
    });
    // ── Event icon helper ──────────────────────────────────────
    const eventIcon = (type) => {
        switch (type) {
            case 'created': return { icon: '+', color: COLORS.success };
            case 'deleted': return { icon: '-', color: COLORS.error };
            case 'modified': return { icon: '~', color: COLORS.warning };
        }
    };
    const visibleEvents = events.slice(scrollOffset, scrollOffset + EVENTS_PER_PAGE);
    // ── Render ─────────────────────────────────────────────────
    return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Timeline" }) }), _jsxs("text", { fg: COLORS.textDim, children: [loading ? 'Loading...' : `${String(events.length)} events`, sessionName ? ` — ${sessionName}` : ''] }), _jsx("box", { style: { height: 1 } }), loading ? (_jsx(Card, { title: "Loading", accent: COLORS.textDim, children: _jsx("text", { fg: COLORS.textMuted, children: "Connecting to daemon..." }) })) : error ? (_jsx(Card, { title: "No Session", accent: COLORS.warning, children: _jsx("text", { fg: COLORS.textMuted, children: error }) })) : events.length === 0 ? (_jsxs(Card, { title: "No Events Yet", accent: COLORS.textDim, children: [_jsx("text", { fg: COLORS.textMuted, children: "Start watching a project and modify files to see events." }), _jsx("text", { fg: COLORS.textDim, children: sessionId ? 'Watching is active — try editing a file.' : 'No active session. Start one from Dashboard.' })] })) : (_jsx(Card, { title: "File Events", children: visibleEvents.map((event, i) => {
                    const idx = scrollOffset + i;
                    const isSelected = idx === selectedIndex;
                    const { icon, color } = eventIcon(event.eventType);
                    return (_jsxs("box", { style: {
                            flexDirection: 'row',
                            backgroundColor: isSelected ? COLORS.surfaceHover : 'transparent',
                            paddingLeft: 1,
                            paddingRight: 1,
                        }, children: [_jsx("text", { fg: isSelected ? COLORS.primary : COLORS.textDim, children: isSelected ? '>' : ' ' }), _jsxs("text", { fg: color, children: [icon, " "] }), _jsx("text", { fg: isSelected ? COLORS.text : COLORS.textMuted, children: event.filePath.length > 50
                                    ? '...' + event.filePath.slice(-47)
                                    : event.filePath }), _jsx("box", { style: { flexGrow: 1 } }), _jsx("text", { fg: event.diffId ? COLORS.info : COLORS.textDim, children: event.diffId ? 'diff' : '' }), _jsxs("text", { fg: COLORS.textDim, children: [" ", new Date(event.timestamp).toLocaleTimeString()] })] }, event.id));
                }) })), events.length > EVENTS_PER_PAGE ? (_jsxs("text", { fg: COLORS.textDim, children: [String(scrollOffset + 1), "\u2013", String(Math.min(scrollOffset + EVENTS_PER_PAGE, events.length)), " of ", String(events.length)] })) : null] }));
}
//# sourceMappingURL=timeline.js.map