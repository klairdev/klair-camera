import { useEffect, useState, useMemo } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard, usePaste } from '@opentui/react';
import { decodePasteBytes } from '@opentui/core';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
import type { FileEvent } from '../../shared/types.js';

// ── Button definitions ──────────────────────────────────────

type ButtonAction = 'start' | 'stop' | 'reset' | 'changedir';

interface ActionButton {
  id: ButtonAction;
  label: string;
  accent: string;
  col: number;
  row: number;
}

const BUTTONS: ActionButton[] = [
  { id: 'start',    label: 'Start Session',   accent: COLORS.success, col: 0, row: 0 },
  { id: 'stop',     label: 'Stop',            accent: COLORS.error,   col: 1, row: 0 },
  { id: 'reset',    label: 'Reset',           accent: COLORS.warning, col: 0, row: 1 },
  { id: 'changedir',label: 'Change Directory', accent: COLORS.info,    col: 1, row: 1 },
];

function findButton(col: number, row: number): number {
  return BUTTONS.findIndex((b) => b.col === col && b.row === row);
}

// ── Static time formatter (captured value, no re-render flicker) ─

function formatStaticTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// ── Component ────────────────────────────────────────────────

export function Dashboard() {
  const { dispatch } = useAppState();
  const api = useApi();
  const [focusedButton, setFocusedButton] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  // Real data from daemon
  const [sessions, setSessions] = useState<number>(0);
  const [events, setEvents] = useState<number>(0);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionPath, setSessionPath] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);

  // Top files and recent events from dashboard endpoint
  const [topFiles, setTopFiles] = useState<{ path: string; count: number }[]>([]);
  const [recentEvents, setRecentEvents] = useState<FileEvent[]>([]);

  // Static start time — captured once, never re-rendered
  const [startTime, setStartTime] = useState<string | null>(null);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

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
      } else {
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

  const doAction = async (id: ButtonAction) => {
    switch (id) {
      case 'start': {
        const active = await api.getActiveSession();
        if (active) {
          setToast('Session already running');
        } else {
          const result = await api.createSession(
            sessionPath || '.',
          );
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
    if (stats) { setSessions(stats.sessions); setEvents(stats.events); }
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
    let next: number;

    if (key.name === 'enter' || key.name === 'return') {
      doAction(btn.id);
      return;
    }
    if (key.name === 'up' || key.name === 'k') {
      next = findButton(btn.col, btn.row <= 0 ? 1 : btn.row - 1);
    } else if (key.name === 'down' || key.name === 'j') {
      next = findButton(btn.col, btn.row >= 1 ? 0 : btn.row + 1);
    } else if (key.name === 'left' || key.name === 'h') {
      next = findButton(btn.col <= 0 ? 1 : btn.col - 1, btn.row);
    } else if (key.name === 'right' || key.name === 'l') {
      next = findButton(btn.col >= 1 ? 0 : btn.col + 1, btn.row);
    } else {
      return;
    }
    if (next >= 0) setFocusedButton(next);
  });

  // ── Paste: handle pasted directory paths ────────────────────

  usePaste((event) => {
    if (!dirInputMode) return;
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
    } else {
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

  return (
    <box style={{ flexDirection: 'column', flexGrow: 1 }}>
      {/* Title */}
      <text fg={COLORS.primary}>
        <strong>Dashboard</strong>
      </text>
      <text fg={COLORS.textDim}>Real-time observability overview</text>

      <box style={{ height: 1 }} />

      {/* Stats Row */}
      <box style={{ flexDirection: 'row', gap: 2 }}>
        <Card title="Sessions" accent={COLORS.info}>
          <text fg={COLORS.text}>{String(sessions)}</text>
        </Card>
        <Card title="Events" accent={COLORS.success}>
          <text fg={COLORS.text}>{String(events)}</text>
        </Card>
        <Card title="Active Session" accent={COLORS.warning}>
          <text fg={COLORS.text}>
            {sessionName || 'None'}
          </text>
        </Card>
      </box>

      {/* Active Session Details */}
      {sessionName ? (
        <Card title="Active Session" accent={COLORS.primary}>
          <text fg={COLORS.textMuted}>Project: <span fg={COLORS.text}>{sessionPath}</span></text>
          {displayTime ? (
            <text fg={COLORS.textMuted}>Started: <span fg={COLORS.text}>{displayTime}</span></text>
          ) : null}
          <text fg={COLORS.textMuted}>Status: <span fg={COLORS.success}>{sessionStatus}</span></text>
        </Card>
      ) : (
        <Card title="No Active Session" accent={COLORS.textDim}>
          <text fg={COLORS.textMuted}>Press Start Session to begin watching</text>
        </Card>
      )}

      <box style={{ height: 1 }} />

      {/* ── Directory input prompt ── */}
      {dirInputMode ? (
        <Card title="Change Directory" accent={COLORS.warning}>
          <box style={{ flexDirection: 'column' }}>
            <text fg={COLORS.textMuted}>Enter new project path:</text>
            <box style={{ height: 1 }} />
            <text fg={COLORS.text}>
              {dirInput || ''}<span fg={COLORS.primary}>_</span>
            </text>
            <text fg={COLORS.textDim}>Enter: confirm | Esc: cancel</text>
          </box>
        </Card>
      ) : (
        /* ── Action buttons ── */
        <Card title="Actions" accent={COLORS.primary}>
          <box style={{ flexDirection: 'column', gap: 1 }}>
            {[0, 1].map((row) => (
              <box key={row} style={{ flexDirection: 'row', gap: 2 }}>
                {BUTTONS.filter((b) => b.row === row).map((btn) => {
                  const idx = BUTTONS.indexOf(btn);
                  const focused = focusedButton === idx;
                  return (
                    <box
                      key={btn.id}
                      style={{
                        border: true,
                        borderColor: focused ? btn.accent : COLORS.border,
                        backgroundColor: focused ? COLORS.surfaceHover : COLORS.surface,
                        paddingLeft: 2,
                        paddingRight: 2,
                        height: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1,
                      }}
                    >
                      <text fg={focused ? btn.accent : COLORS.text}>{btn.label}</text>
                    </box>
                  );
                })}
              </box>
            ))}
          </box>
        </Card>
      )}

      {/* Toast / Hint */}
      <text fg={toast ? COLORS.warning : COLORS.textDim}>
        {'  '}{toast || '↑↓←→: navigate | Enter: activate'}
      </text>

      <box style={{ height: 1 }} />

      {/* Top Files */}
      {topFiles.length > 0 ? (
        <Card title="Top Changed Files" accent={COLORS.info}>
          {topFiles.slice(0, 5).map((file, i) => (
            <box key={file.path} style={{ flexDirection: 'row' }}>
              <text fg={COLORS.textDim}>{String(i + 1).padStart(2, ' ')}. </text>
              <text fg={COLORS.text}>{file.path}</text>
              <box style={{ flexGrow: 1 }} />
              <text fg={COLORS.info}>{String(file.count)} changes</text>
            </box>
          ))}
        </Card>
      ) : null}

      {/* Recent Events */}
      {recentEvents.length > 0 ? (
        <Card title="Recent Events" accent={COLORS.textMuted}>
          {recentEvents.slice(0, 8).map((event) => (
            <box key={event.id} style={{ flexDirection: 'row' }}>
              <text fg={
                event.eventType === 'created' ? COLORS.success :
                event.eventType === 'deleted' ? COLORS.error :
                COLORS.warning
              }>
                {event.eventType === 'created' ? '+' : event.eventType === 'deleted' ? '-' : '~'}
              </text>
              <text fg={COLORS.text}> {event.filePath}</text>
              <box style={{ flexGrow: 1 }} />
              <text fg={COLORS.textDim}>{new Date(event.timestamp).toLocaleTimeString()}</text>
            </box>
          ))}
        </Card>
      ) : null}
    </box>
  );
}
