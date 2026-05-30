import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { COLORS } from '../styles/colors.js';
export function Card({ title, children, accent }) {
    return (_jsxs("box", { style: {
            border: true,
            borderColor: accent || COLORS.border,
            padding: 1,
            flexDirection: 'column',
            marginBottom: 1,
        }, children: [title ? (_jsx("box", { style: { border: false, paddingBottom: 1 }, children: _jsx("text", { fg: accent || COLORS.primary, children: _jsx("strong", { children: title }) }) })) : null, children] }));
}
//# sourceMappingURL=card.js.map