import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useAppState } from '../store/app-store.js';
import { COLORS } from '../styles/colors.js';
export function Header() {
    const { state, dispatch } = useAppState();
    const tabs = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'timeline', label: 'Timeline' },
        { key: 'diff-viewer', label: 'Diff' },
        { key: 'settings', label: 'Settings' },
    ];
    return (_jsxs("box", { style: {
            height: 3,
            backgroundColor: COLORS.surface,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 2,
            paddingRight: 2,
        }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "KLAIR" }) }), _jsx("box", { style: { flexGrow: 1 } }), tabs.map((tab, i) => (_jsxs("box", { style: { paddingLeft: 1, paddingRight: 1 }, children: [_jsx("text", { fg: state.currentPage === tab.key ? COLORS.primary : COLORS.textMuted, children: state.currentPage === tab.key ? `[${tab.label}]` : ` ${tab.label} ` }), _jsxs("text", { fg: COLORS.textDim, children: [" ", String(i + 1)] })] }, tab.key)))] }));
}
//# sourceMappingURL=header.js.map