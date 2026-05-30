import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { COLORS } from '../styles/colors.js';
export function Button({ label, selected, accent }) {
    const borderColor = selected ? accent || COLORS.primary : COLORS.border;
    const bgColor = selected ? COLORS.surfaceHover : COLORS.surface;
    return (_jsx("box", { style: {
            border: true,
            borderColor,
            backgroundColor: bgColor,
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 0,
            paddingBottom: 0,
            height: 3,
            alignItems: 'center',
            justifyContent: 'center',
        }, children: _jsx("text", { fg: selected ? (accent || COLORS.primary) : COLORS.text, children: label }) }));
}
//# sourceMappingURL=button.js.map