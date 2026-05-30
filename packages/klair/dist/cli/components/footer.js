import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useAppState } from '../store/app-store.js';
import { COLORS } from '../styles/colors.js';
export function Footer() {
    const { state } = useAppState();
    const page = state.currentPage;
    const shortcuts = {
        dashboard: '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Navigate Enter:Select',
        timeline: '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Scroll Enter:View Diff',
        'diff-viewer': '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Scroll Esc:Back',
        settings: '↑↓:Navigate Enter:Edit Esc:Back | 1-4:Switch tabs',
    };
    return (_jsxs("box", { style: {
            height: 1,
            backgroundColor: COLORS.surface,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 2,
            paddingRight: 2,
        }, children: [_jsx("text", { fg: COLORS.textDim, children: shortcuts[page] || 'Ctrl+Q:Quit' }), _jsx("box", { style: { flexGrow: 1 } }), _jsx("text", { fg: COLORS.textMuted, children: "Ctrl+Q Quit" })] }));
}
//# sourceMappingURL=footer.js.map