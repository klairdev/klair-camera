import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { createCliRenderer } from '@opentui/core';
import { createRoot, useKeyboard } from '@opentui/react';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { Dashboard } from './pages/dashboard.js';
import { Timeline } from './pages/timeline.js';
import { DiffViewer } from './pages/diff-viewer.js';
import { Settings } from './pages/settings.js';
import { AppProvider, useAppState } from './store/app-store.js';
function App() {
    const { state, dispatch } = useAppState();
    useKeyboard((key) => {
        if (key.name === 'q' && (key.ctrl || key.meta)) {
            process.exit(0);
        }
        // Tab navigation — blocked during edit mode
        if (state.isEditing)
            return;
        if (key.name === '1')
            dispatch({ type: 'SET_PAGE', page: 'dashboard' });
        if (key.name === '2')
            dispatch({ type: 'SET_PAGE', page: 'timeline' });
        if (key.name === '3')
            dispatch({ type: 'SET_PAGE', page: 'diff-viewer' });
        if (key.name === '4')
            dispatch({ type: 'SET_PAGE', page: 'settings' });
        if (key.name === 'tab') {
            const pages = ['dashboard', 'timeline', 'diff-viewer', 'settings'];
            const idx = pages.indexOf(state.currentPage);
            dispatch({ type: 'SET_PAGE', page: pages[(idx + 1) % pages.length] });
        }
    });
    return (_jsxs("box", { style: { flexDirection: 'column', height: '100%', backgroundColor: '#0A0A0A' }, children: [_jsx(Header, {}), _jsxs("box", { style: { flexGrow: 1, flexDirection: 'column', padding: 1 }, children: [state.currentPage === 'dashboard' && _jsx(Dashboard, {}), state.currentPage === 'timeline' && _jsx(Timeline, {}), state.currentPage === 'diff-viewer' && _jsx(DiffViewer, {}), state.currentPage === 'settings' && _jsx(Settings, {})] }), _jsx(Footer, {})] }));
}
async function main() {
    const renderer = await createCliRenderer({
        exitOnCtrlC: true,
    });
    createRoot(renderer).render(_jsx(AppProvider, { children: _jsx(App, {}) }));
}
main().catch((err) => {
    console.error('Failed to start TUI:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map