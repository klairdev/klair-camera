import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
export function DiffViewer() {
    const { state, dispatch } = useAppState();
    const api = useApi();
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            if (cancelled)
                return;
            setLoading(false);
            if (d) {
                setDiff(d);
            }
            else {
                setError('No diff available. File may not be tracked by git, or the diff capture is still processing.');
            }
        }).catch(() => {
            if (cancelled)
                return;
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
        return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Diff Viewer" }) }), _jsx("box", { style: { height: 1 } }), _jsxs(Card, { title: "No Event Selected", accent: COLORS.textDim, children: [_jsx("text", { fg: COLORS.textMuted, children: "Select an event from the Timeline to view its diff." }), _jsx("text", { fg: COLORS.textDim, children: "Press 2 to go to Timeline, then Enter on an event with \"diff\" label." })] })] }));
    }
    // ── Loading ─────────────────────────────────────────────────
    if (loading) {
        return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Diff Viewer" }) }), _jsx("box", { style: { height: 1 } }), _jsx(Card, { title: "Loading", accent: COLORS.textDim, children: _jsx("text", { fg: COLORS.textMuted, children: "Fetching diff from daemon..." }) })] }));
    }
    // ── Error or no diff ────────────────────────────────────────
    if (error || !diff) {
        return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Diff Viewer" }) }), _jsx("box", { style: { height: 1 } }), _jsxs(Card, { title: "No Diff Available", accent: COLORS.warning, children: [_jsx("text", { fg: COLORS.textMuted, children: error || 'This event has no diff data.' }), _jsx("text", { fg: COLORS.textDim, children: "File may not be tracked by git. Press Esc to return to Timeline." })] })] }));
    }
    // ── Diff rendered ───────────────────────────────────────────
    const diffLines = diff.content ? diff.content.split('\n') : [];
    return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Diff Viewer" }) }), _jsxs("text", { fg: COLORS.textDim, children: [diff.filePath || 'Unknown file', ' — +', String(diff.linesAdded), ' -', String(diff.linesRemoved)] }), _jsx("box", { style: { height: 1 } }), _jsx(Card, { title: diff.filePath, accent: COLORS.info, children: _jsx("box", { style: { flexDirection: 'column', maxHeight: 30 }, children: diffLines.slice(scrollOffset, scrollOffset + 25).map((line, i) => {
                        const lineNum = scrollOffset + i + 1;
                        let fg = COLORS.text;
                        if (line.startsWith('+') && !line.startsWith('+++'))
                            fg = COLORS.success;
                        else if (line.startsWith('-') && !line.startsWith('---'))
                            fg = COLORS.error;
                        else if (line.startsWith('@@'))
                            fg = COLORS.info;
                        else if (line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')) {
                            fg = COLORS.textDim;
                        }
                        const displayLine = line.length > 100 ? line.substring(0, 97) + '...' : line;
                        return (_jsxs("box", { style: { flexDirection: 'row' }, children: [_jsx("text", { fg: COLORS.textDim, children: String(lineNum).padStart(4, ' ') }), _jsx("text", { fg: fg, children: displayLine })] }, lineNum));
                    }) }) }), _jsxs("text", { fg: COLORS.textDim, children: ["Lines ", String(scrollOffset + 1), "\u2013", String(Math.min(scrollOffset + 25, diffLines.length)), " of ", String(diffLines.length), ' | ', "Esc: back to Timeline"] })] }));
}
//# sourceMappingURL=diff-viewer.js.map