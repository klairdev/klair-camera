import { useEffect, useState } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
import type { Diff } from '../../shared/types.js';

export function DiffViewer() {
  const { state, dispatch } = useAppState();
  const api = useApi();
  const [diff, setDiff] = useState<Diff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    if (!state.selectedEventId) {
      setDiff(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setScrollOffset(0);
    setDiff(null);

    api.getDiff(state.selectedEventId).then((d) => {
      if (cancelled) return;
      setLoading(false);
      if (d) {
        setDiff(d);
      } else {
        setError('No diff available. File may not be tracked by git, or the diff capture is still processing.');
      }
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
      setError('Failed to load diff from daemon.');
    });

    return () => { cancelled = true; };
  }, [state.selectedEventId]);

  useKeyboard((key) => {
    if (key.name === 'escape') {
      dispatch({ type: 'SET_PAGE', page: 'timeline' });
      dispatch({ type: 'SELECT_EVENT', eventId: null });
    }
    if (key.name === 'up' || key.name === 'k') {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    }
    if (key.name === 'down' || key.name === 'j') {
      setScrollOffset((prev) => prev + 1);
    }
    if (key.name === 'pageup') {
      setScrollOffset((prev) => Math.max(0, prev - 25));
    }
    if (key.name === 'pagedown') {
      setScrollOffset((prev) => prev + 25);
    }
  });

  // ── No event selected ───────────────────────────────────────

  if (!state.selectedEventId) {
    return (
      <box style={{ flexDirection: 'column', flexGrow: 1 }}>
        <text fg={COLORS.primary}><strong>Diff Viewer</strong></text>
        <box style={{ height: 1 }} />
        <Card title="No Event Selected" accent={COLORS.textDim}>
          <text fg={COLORS.textMuted}>Select an event from the Timeline to view its diff.</text>
          <text fg={COLORS.textDim}>Press 2 to go to Timeline, then Enter on an event with "diff" label.</text>
        </Card>
      </box>
    );
  }

  // ── Loading ─────────────────────────────────────────────────

  if (loading) {
    return (
      <box style={{ flexDirection: 'column', flexGrow: 1 }}>
        <text fg={COLORS.primary}><strong>Diff Viewer</strong></text>
        <box style={{ height: 1 }} />
        <Card title="Loading" accent={COLORS.textDim}>
          <text fg={COLORS.textMuted}>Fetching diff from daemon...</text>
        </Card>
      </box>
    );
  }

  // ── Error or no diff ────────────────────────────────────────

  if (error || !diff) {
    return (
      <box style={{ flexDirection: 'column', flexGrow: 1 }}>
        <text fg={COLORS.primary}><strong>Diff Viewer</strong></text>
        <box style={{ height: 1 }} />
        <Card title="No Diff Available" accent={COLORS.warning}>
          <text fg={COLORS.textMuted}>{error || 'This event has no diff data.'}</text>
          <text fg={COLORS.textDim}>File may not be tracked by git. Press Esc to return to Timeline.</text>
        </Card>
      </box>
    );
  }

  // ── Diff rendered ───────────────────────────────────────────

  const diffLines = diff.content ? diff.content.split('\n') : [];

  return (
    <box style={{ flexDirection: 'column', flexGrow: 1 }}>
      <text fg={COLORS.primary}>
        <strong>Diff Viewer</strong>
      </text>
      <text fg={COLORS.textDim}>
        {diff.filePath || 'Unknown file'}
        {' — +'}{String(diff.linesAdded)}{' -'}{String(diff.linesRemoved)}
      </text>

      <box style={{ height: 1 }} />

      <Card title={diff.filePath} accent={COLORS.info}>
        <box style={{ flexDirection: 'column', maxHeight: 30 }}>
          {diffLines.slice(scrollOffset, scrollOffset + 25).map((line, i) => {
            const lineNum = scrollOffset + i + 1;
            let fg: string = COLORS.text;
            if (line.startsWith('+') && !line.startsWith('+++')) fg = COLORS.success;
            else if (line.startsWith('-') && !line.startsWith('---')) fg = COLORS.error;
            else if (line.startsWith('@@')) fg = COLORS.info;
            else if (line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')) {
              fg = COLORS.textDim;
            }

            const displayLine = line.length > 100 ? line.substring(0, 97) + '...' : line;

            return (
              <box key={lineNum} style={{ flexDirection: 'row' }}>
                <text fg={COLORS.textDim}>
                  {String(lineNum).padStart(4, ' ')}
                </text>
                <text fg={fg}>{displayLine}</text>
              </box>
            );
          })}
        </box>
      </Card>

      <text fg={COLORS.textDim}>
        Lines {String(scrollOffset + 1)}–{String(Math.min(scrollOffset + 25, diffLines.length))} of {String(diffLines.length)}
        {' | '}Esc: back to Timeline
      </text>
    </box>
  );
}
