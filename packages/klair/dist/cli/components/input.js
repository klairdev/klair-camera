import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { COLORS } from '../styles/colors.js';
export function Input({ value, placeholder, focused, label }) {
    const displayValue = value || placeholder || '';
    const fg = value ? COLORS.text : COLORS.textDim;
    return (_jsxs("box", { style: { flexDirection: 'column' }, children: [label ? (_jsx("text", { fg: COLORS.textMuted, children: label })) : null, _jsx("box", { style: {
                    border: true,
                    borderColor: focused ? COLORS.primary : COLORS.border,
                    backgroundColor: focused ? COLORS.surfaceHover : COLORS.surface,
                    paddingLeft: 1,
                    paddingRight: 1,
                    height: 3,
                    alignItems: 'center',
                }, children: _jsxs("text", { fg: fg, children: [displayValue, focused ? _jsx("span", { fg: COLORS.primary, children: "_" }) : null] }) })] }));
}
//# sourceMappingURL=input.js.map