import { useEffect, useState, useRef } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
import type { FileEvent } from '../../shared/types.js';

const EVENTS_PER_PAGE = 20;
const POLL_MS = 2000;

export function Timeline() {
  const { dispatch } = useAppState();
  const api = useApi();

  // Self-sufficient state — not dependent on app store
  const [events, setEvents] = useState<FileEvent[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      if (cancelled) return;

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
    if (events.length === 0) return;

    if (key.name === 'up' || key.name === 'k') {
      setSelectedIndex((prev) => {
        const next = Math.max(0, prev - 1);
        if (next < scrollOffset) setScrollOffset(next);
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

  const eventIcon = (type: FileEvent['eventType']) => {
    switch (type) {
      case 'created': return { icon: '+', color: COLORS.success };
      case 'deleted': return { icon: '-', color: COLORS.error };
      case 'modified': return { icon: '~', color: COLORS.warning };
    }
  };

  const visibleEvents = events.slice(scrollOffset, scrollOffset + EVENTS_PER_PAGE);

  // ── Render ─────────────────────────────────────────────────

  return (
    <box style={{ flexDirection: 'column', flexGrow: 1 }}>
      <text fg={COLORS.primary}>
        <strong>Timeline</strong>
      </text>
      <text fg={COLORS.textDim}>
        {loading ? 'Loading...' : `${String(events.length)} events`}
        {sessionName ? ` — ${sessionName}` : ''}
      </text>

      <box style={{ height: 1 }} />

      {loading ? (
        <Card title="Loading" accent={COLORS.textDim}>
          <text fg={COLORS.textMuted}>Connecting to daemon...</text>
        </Card>
      ) : error ? (
        <Card title="No Session" accent={COLORS.warning}>
          <text fg={COLORS.textMuted}>{error}</text>
        </Card>
      ) : events.length === 0 ? (
        <Card title="No Events Yet" accent={COLORS.textDim}>
          <text fg={COLORS.textMuted}>Start watching a project and modify files to see events.</text>
          <text fg={COLORS.textDim}>
            {sessionId ? 'Watching is active — try editing a file.' : 'No active session. Start one from Dashboard.'}
          </text>
        </Card>
      ) : (
        <Card title="File Events">
          {visibleEvents.map((event, i) => {
            const idx = scrollOffset + i;
            const isSelected = idx === selectedIndex;
            const { icon, color } = eventIcon(event.eventType);

            return (
              <box
                key={event.id}
                style={{
                  flexDirection: 'row',
                  backgroundColor: isSelected ? COLORS.surfaceHover : 'transparent',
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <text fg={isSelected ? COLORS.primary : COLORS.textDim}>
                  {isSelected ? '>' : ' '}
                </text>
                <text fg={color}>{icon} </text>
                <text fg={isSelected ? COLORS.text : COLORS.textMuted}>
                  {event.filePath.length > 50
                    ? '...' + event.filePath.slice(-47)
                    : event.filePath}
                </text>
                <box style={{ flexGrow: 1 }} />
                <text fg={event.diffId ? COLORS.info : COLORS.textDim}>
                  {event.diffId ? 'diff' : ''}
                </text>
                <text fg={COLORS.textDim}> {new Date(event.timestamp).toLocaleTimeString()}</text>
              </box>
            );
          })}
        </Card>
      )}

      {events.length > EVENTS_PER_PAGE ? (
        <text fg={COLORS.textDim}>
          {String(scrollOffset + 1)}–{String(Math.min(scrollOffset + EVENTS_PER_PAGE, events.length))} of {String(events.length)}
        </text>
      ) : null}
    </box>
  );
}
