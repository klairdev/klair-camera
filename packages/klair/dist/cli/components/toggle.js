import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { COLORS } from '../styles/colors.js';
export function Toggle({ value, label, focused }) {
    return (_jsxs("box", { style: { flexDirection: 'row', alignItems: 'center', gap: 1 }, children: [label ? (_jsx("text", { fg: COLORS.text, children: label })) : null, _jsx("box", { style: {
                    width: 12,
                    height: 1,
                    border: true,
                    borderColor: focused ? COLORS.primary : COLORS.border,
                    backgroundColor: value ? COLORS.success : COLORS.surface,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: value ? 2 : 0,
                    paddingRight: value ? 0 : 2,
                }, children: _jsx("text", { fg: value ? COLORS.white : COLORS.textDim, children: value ? ' ON ' : ' OFF ' }) })] }));
}
//# sourceMappingURL=toggle.js.map