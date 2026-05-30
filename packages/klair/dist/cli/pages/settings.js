import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
const DEFAULT_PATTERNS = [
    'node_modules',
    '.git',
    '.env',
    'dist',
    'build',
    '.DS_Store',
    '*.log',
    '.cache',
];
const FIELDS = [
    {
        key: 'watchDebounceMs',
        label: 'Debounce (ms)',
        type: 'number',
        description: 'Delay before capturing changes',
        min: 0,
        max: 5000,
    },
    {
        key: 'maxEventsPerSession',
        label: 'Max Events',
        type: 'number',
        description: 'Maximum events stored per session',
        min: 100,
        max: 100000,
    },
    {
        key: 'ignorePatterns',
        label: 'Ignore Patterns',
        type: 'checkbox-list',
        description: 'File patterns to ignore',
        options: DEFAULT_PATTERNS,
    },
    {
        key: 'theme',
        label: 'Theme',
        type: 'dropdown',
        description: 'UI theme',
        options: ['dark', 'light'],
    },
    {
        key: 'autoStart',
        label: 'Auto Start',
        type: 'toggle',
        description: 'Auto-start watcher on launch',
    },
];
// ── Helpers ──────────────────────────────────────────────────
function isDigit(name) {
    return name.length === 1 && name >= '0' && name <= '9';
}
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
/** Build checkbox items: all DEFAULT_PATTERNS, marked enabled if present in settings */
function buildCheckboxItems(currentPatterns) {
    return DEFAULT_PATTERNS.map((p) => ({
        name: p,
        enabled: currentPatterns.includes(p),
    }));
}
// ── Component ────────────────────────────────────────────────
export function Settings() {
    const { state: appState, dispatch } = useAppState();
    const api = useApi();
    const [settings, setSettings] = useState(null);
    // focus = highlight (arrow nav); edit = input open (-1 = none)
    const [focusedField, setFocusedField] = useState(0);
    const [editingField, setEditingField] = useState(-1);
    const [editValue, setEditValue] = useState('');
    // Checkbox-list specific state
    const [checkboxItems, setCheckboxItems] = useState([]);
    const [checkboxCursor, setCheckboxCursor] = useState(0);
    const [saved, setSaved] = useState(false);
    // ── Load settings on mount ─────────────────────────────────
    useEffect(() => {
        api.getSettings().then((s) => {
            if (s)
                setSettings(s);
        });
    }, []);
    // ── Keyboard handler ───────────────────────────────────────
    useKeyboard((key) => {
        // ═══════════════════════════════════════════════════════
        //  EDIT MODE
        // ═══════════════════════════════════════════════════════
        if (editingField >= 0) {
            const field = FIELDS[editingField];
            // ── Common edit keys ──────────────────────────────
            if (key.name === 'escape') {
                setEditingField(-1);
                setEditValue('');
                setCheckboxItems([]);
                setCheckboxCursor(0);
                dispatch({ type: 'SET_EDITING', editing: false });
                return;
            }
            if (key.name === 'enter' || key.name === 'return') {
                saveField(editingField);
                return;
            }
            // ── Checkbox list ─────────────────────────────────
            if (field.type === 'checkbox-list') {
                if (key.name === 'up' || key.name === 'k') {
                    setCheckboxCursor((prev) => prev <= 0 ? checkboxItems.length - 1 : prev - 1);
                    return;
                }
                if (key.name === 'down' || key.name === 'j') {
                    setCheckboxCursor((prev) => prev >= checkboxItems.length - 1 ? 0 : prev + 1);
                    return;
                }
                if (key.name === 'space') {
                    setCheckboxItems((prev) => prev.map((item, i) => i === checkboxCursor ? { ...item, enabled: !item.enabled } : item));
                    return;
                }
                return; // block all other keys
            }
            // ── Number field: digits only ─────────────────────
            if (field.type === 'number') {
                if (key.name === 'backspace') {
                    setEditValue((prev) => prev.slice(0, -1));
                    return;
                }
                if (isDigit(key.name)) {
                    const next = editValue + key.name;
                    const n = parseInt(next, 10);
                    if (!isNaN(n) && n >= (field.min ?? 0) && n <= (field.max ?? Infinity)) {
                        setEditValue(next);
                    }
                    return;
                }
                return; // block all other keys silently
            }
            // ── Dropdown: arrows cycle options ────────────────
            if (field.type === 'dropdown') {
                if (key.name === 'left' || key.name === 'right') {
                    const options = field.options ?? [];
                    const idx = options.indexOf(editValue);
                    const nextIdx = key.name === 'left'
                        ? (idx <= 0 ? options.length - 1 : idx - 1)
                        : (idx >= options.length - 1 ? 0 : idx + 1);
                    setEditValue(options[nextIdx]);
                    return;
                }
                return; // block all other keys
            }
            // ── Toggle: space or arrows flip ──────────────────
            if (field.type === 'toggle') {
                if (key.name === 'space' || key.name === 'left' || key.name === 'right') {
                    setEditValue((prev) => (prev === 'true' ? 'false' : 'true'));
                    return;
                }
                return; // block all other keys
            }
            // ── Text field: free input ────────────────────────
            if (key.name === 'backspace') {
                setEditValue((prev) => prev.slice(0, -1));
                return;
            }
            if (key.name && key.name.length === 1) {
                setEditValue((prev) => prev + key.name);
            }
            return;
        }
        // ═══════════════════════════════════════════════════════
        //  NAVIGATION MODE
        // ═══════════════════════════════════════════════════════
        if (key.name === 'escape') {
            dispatch({ type: 'SET_PAGE', page: 'dashboard' });
            return;
        }
        if (key.name === 'enter' || key.name === 'return') {
            startEditing(focusedField);
            return;
        }
        // Arrow Up / k = previous field (wrap)
        if (key.name === 'up' || key.name === 'k') {
            setFocusedField((prev) => (prev <= 0 ? FIELDS.length - 1 : prev - 1));
            return;
        }
        // Arrow Down / j = next field (wrap)
        if (key.name === 'down' || key.name === 'j') {
            setFocusedField((prev) => (prev >= FIELDS.length - 1 ? 0 : prev + 1));
            return;
        }
    });
    // ── Start / save ───────────────────────────────────────────
    const startEditing = useCallback((fieldIndex) => {
        if (!settings)
            return;
        const field = FIELDS[fieldIndex];
        const val = settings[field.key];
        setEditingField(fieldIndex);
        dispatch({ type: 'SET_EDITING', editing: true });
        if (field.type === 'checkbox-list') {
            const patterns = Array.isArray(val) ? val : [];
            setCheckboxItems(buildCheckboxItems(patterns));
            setCheckboxCursor(0);
            setEditValue('');
        }
        else if (field.type === 'dropdown') {
            setEditValue(String(val));
        }
        else if (field.type === 'toggle') {
            setEditValue(String(val));
        }
        else {
            setEditValue(Array.isArray(val) ? val.join(', ') : String(val));
        }
    }, [settings, dispatch]);
    const saveField = useCallback(async (fieldIndex) => {
        if (!settings)
            return;
        const field = FIELDS[fieldIndex];
        let value = editValue;
        switch (field.type) {
            case 'checkbox-list': {
                value = checkboxItems.filter((item) => item.enabled).map((item) => item.name);
                break;
            }
            case 'number': {
                const n = parseInt(editValue, 10);
                value = isNaN(n) ? (field.min ?? 0) : clamp(n, field.min ?? -Infinity, field.max ?? Infinity);
                break;
            }
            case 'toggle':
                value = editValue === 'true';
                break;
            case 'dropdown':
                value = editValue;
                break;
            default:
                value = editValue.split(',').map((s) => s.trim()).filter(Boolean);
        }
        const updated = await api.updateSettings({ [field.key]: value });
        if (updated) {
            setSettings(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setEditingField(-1);
        setEditValue('');
        setCheckboxItems([]);
        setCheckboxCursor(0);
        dispatch({ type: 'SET_EDITING', editing: false });
    }, [settings, editValue, checkboxItems, api, dispatch]);
    // ── Loading state ──────────────────────────────────────────
    if (!settings) {
        return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Settings" }) }), _jsx("box", { style: { height: 1 } }), _jsx("text", { fg: COLORS.textMuted, children: "Loading settings..." })] }));
    }
    // ── Value formatters ──────────────────────────────────────
    const formatValue = (field) => {
        const val = settings[field.key];
        if (field.type === 'checkbox-list') {
            const arr = Array.isArray(val) ? val : [];
            if (arr.length === 0)
                return 'none';
            return `${arr.length} pattern${arr.length !== 1 ? 's' : ''}`;
        }
        if (Array.isArray(val))
            return val.join(', ');
        if (typeof val === 'boolean')
            return val ? 'ON' : 'OFF';
        return String(val);
    };
    // ── Render ────────────────────────────────────────────────
    return (_jsxs("box", { style: { flexDirection: 'column', flexGrow: 1 }, children: [_jsxs("box", { style: { flexDirection: 'row', alignItems: 'center' }, children: [_jsx("text", { fg: COLORS.primary, children: _jsx("strong", { children: "Settings" }) }), _jsx("box", { style: { flexGrow: 1 } }), saved ? _jsx("text", { fg: COLORS.success, children: "Saved!" }) : null] }), _jsx("text", { fg: COLORS.textDim, children: "Configure watcher behavior and preferences" }), _jsx("box", { style: { height: 1 } }), _jsx(Card, { title: "Configuration", children: FIELDS.map((field, i) => {
                    const isFocused = focusedField === i;
                    const isEditing = editingField === i;
                    return (_jsxs("box", { style: { flexDirection: 'column', paddingBottom: 1 }, children: [_jsxs("box", { style: {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: isFocused && !isEditing ? COLORS.surfaceHover : 'transparent',
                                    paddingLeft: 1,
                                }, children: [_jsx("text", { fg: isFocused ? COLORS.primary : COLORS.textDim, children: isFocused ? '>' : ' ' }), _jsx("text", { fg: isEditing ? COLORS.warning : isFocused ? COLORS.primary : COLORS.text, children: field.label }), _jsx("box", { style: { flexGrow: 1 } }), isEditing && field.type === 'checkbox-list' ? null : (isEditing ? (field.type === 'dropdown' ? (
                                    /* Dropdown: show arrow-wrapped option */
                                    _jsxs("box", { style: { flexDirection: 'row', gap: 1 }, children: [_jsx("text", { fg: COLORS.textDim, children: "\u25C4" }), _jsxs("text", { fg: COLORS.info, children: ["[", editValue, "]"] }), _jsx("text", { fg: COLORS.textDim, children: "\u25BA" })] })) : field.type === 'toggle' ? (
                                    /* Toggle: show ON/OFF with highlight */
                                    _jsxs("text", { fg: editValue === 'true' ? COLORS.success : COLORS.textDim, children: ["[", editValue === 'true' ? 'ON' : 'OFF', "]"] })) : field.type === 'number' ? (
                                    /* Number: show cursor */
                                    _jsxs("text", { fg: COLORS.text, children: [editValue || '0', _jsx("span", { fg: COLORS.primary, children: "_" })] })) : (
                                    /* Text: show cursor */
                                    _jsxs("text", { fg: COLORS.text, children: [editValue, _jsx("span", { fg: COLORS.primary, children: "_" })] }))) : (
                                    /* ── View mode rendering ── */
                                    _jsx("text", { fg: field.key === 'autoStart'
                                            ? settings.autoStart
                                                ? COLORS.success
                                                : COLORS.textDim
                                            : COLORS.info, children: formatValue(field) })))] }), isEditing && field.type === 'checkbox-list' ? (_jsx("box", { style: { flexDirection: 'column', paddingLeft: 4, paddingTop: 1 }, children: checkboxItems.map((item, ci) => {
                                    const isCursor = ci === checkboxCursor;
                                    return (_jsxs("box", { style: {
                                            flexDirection: 'row',
                                            backgroundColor: isCursor ? COLORS.surfaceHover : 'transparent',
                                        }, children: [_jsx("text", { fg: isCursor ? COLORS.primary : COLORS.textDim, children: isCursor ? '>' : ' ' }), _jsxs("text", { fg: item.enabled ? COLORS.success : COLORS.textDim, children: ["[", item.enabled ? 'x' : ' ', "]"] }), _jsxs("text", { fg: isCursor ? COLORS.text : COLORS.textMuted, children: [' ', item.name] })] }, item.name));
                                }) })) : null, _jsxs("box", { style: { flexDirection: 'row', paddingLeft: 2 }, children: [_jsx("text", { fg: COLORS.textDim, children: field.description }), isEditing && field.type === 'number' && (_jsxs("text", { fg: COLORS.textDim, children: [' ', "(", field.min, "\u2013", field.max, ")"] }))] })] }, field.key));
                }) }), _jsx("text", { fg: COLORS.textDim, children: editingField >= 0
                    ? (() => {
                        const ft = FIELDS[editingField].type;
                        if (ft === 'checkbox-list')
                            return '↑↓: navigate | Space: toggle | Enter: save | Esc: cancel';
                        if (ft === 'number')
                            return '0-9: type | Backspace: delete | Enter: save | Esc: cancel';
                        if (ft === 'dropdown')
                            return '◄►: choose option | Enter: save | Esc: cancel';
                        if (ft === 'toggle')
                            return 'Space/◄►: toggle | Enter: save | Esc: cancel';
                        return 'Type to edit | Enter: save | Esc: cancel';
                    })()
                    : '↑↓: select field | Enter: edit | Esc: back to Dashboard' })] }));
}
//# sourceMappingURL=settings.js.map