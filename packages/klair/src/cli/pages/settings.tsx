import { useEffect, useState, useCallback } from 'react';
import { useAppState } from '../store/app-store.js';
import { useApi } from '../hooks/use-api.js';
import { useKeyboard } from '@opentui/react';
import { Card } from '../components/card.js';
import { COLORS } from '../styles/colors.js';
import type { KlairSettings } from '../../shared/types.js';

// ── Field type system ────────────────────────────────────────

type FieldType = 'number' | 'text' | 'dropdown' | 'toggle' | 'checkbox-list';

type SettingField = {
  key: keyof KlairSettings;
  label: string;
  type: FieldType;
  description: string;
  min?: number;
  max?: number;
  options?: string[];   // dropdown choices / checkbox items
};

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

const FIELDS: SettingField[] = [
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

function isDigit(name: string): boolean {
  return name.length === 1 && name >= '0' && name <= '9';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

type CheckboxItem = { name: string; enabled: boolean };

/** Build checkbox items: all DEFAULT_PATTERNS, marked enabled if present in settings */
function buildCheckboxItems(currentPatterns: string[]): CheckboxItem[] {
  return DEFAULT_PATTERNS.map((p) => ({
    name: p,
    enabled: currentPatterns.includes(p),
  }));
}

// ── Component ────────────────────────────────────────────────

export function Settings() {
  const { state: appState, dispatch } = useAppState();
  const api = useApi();
  const [settings, setSettings] = useState<KlairSettings | null>(null);

  // focus = highlight (arrow nav); edit = input open (-1 = none)
  const [focusedField, setFocusedField] = useState<number>(0);
  const [editingField, setEditingField] = useState<number>(-1);
  const [editValue, setEditValue] = useState('');

  // Checkbox-list specific state
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItem[]>([]);
  const [checkboxCursor, setCheckboxCursor] = useState<number>(0);

  const [saved, setSaved] = useState(false);

  // ── Load settings on mount ─────────────────────────────────

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) setSettings(s);
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
          setCheckboxCursor((prev) =>
            prev <= 0 ? checkboxItems.length - 1 : prev - 1
          );
          return;
        }
        if (key.name === 'down' || key.name === 'j') {
          setCheckboxCursor((prev) =>
            prev >= checkboxItems.length - 1 ? 0 : prev + 1
          );
          return;
        }
        if (key.name === 'space') {
          setCheckboxItems((prev) =>
            prev.map((item, i) =>
              i === checkboxCursor ? { ...item, enabled: !item.enabled } : item
            )
          );
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

  const startEditing = useCallback((fieldIndex: number) => {
    if (!settings) return;
    const field = FIELDS[fieldIndex];
    const val = settings[field.key];
    setEditingField(fieldIndex);
    dispatch({ type: 'SET_EDITING', editing: true });

    if (field.type === 'checkbox-list') {
      const patterns = Array.isArray(val) ? val as string[] : [];
      setCheckboxItems(buildCheckboxItems(patterns));
      setCheckboxCursor(0);
      setEditValue('');
    } else if (field.type === 'dropdown') {
      setEditValue(String(val));
    } else if (field.type === 'toggle') {
      setEditValue(String(val));
    } else {
      setEditValue(Array.isArray(val) ? val.join(', ') : String(val));
    }
  }, [settings, dispatch]);

  const saveField = useCallback(async (fieldIndex: number) => {
    if (!settings) return;
    const field = FIELDS[fieldIndex];
    let value: unknown = editValue;

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
    return (
      <box style={{ flexDirection: 'column', flexGrow: 1 }}>
        <text fg={COLORS.primary}><strong>Settings</strong></text>
        <box style={{ height: 1 }} />
        <text fg={COLORS.textMuted}>Loading settings...</text>
      </box>
    );
  }

  // ── Value formatters ──────────────────────────────────────

  const formatValue = (field: SettingField): string => {
    const val = settings[field.key];
    if (field.type === 'checkbox-list') {
      const arr = Array.isArray(val) ? val as string[] : [];
      if (arr.length === 0) return 'none';
      return `${arr.length} pattern${arr.length !== 1 ? 's' : ''}`;
    }
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'ON' : 'OFF';
    return String(val);
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <box style={{ flexDirection: 'column', flexGrow: 1 }}>
      {/* Header */}
      <box style={{ flexDirection: 'row', alignItems: 'center' }}>
        <text fg={COLORS.primary}><strong>Settings</strong></text>
        <box style={{ flexGrow: 1 }} />
        {saved ? <text fg={COLORS.success}>Saved!</text> : null}
      </box>
      <text fg={COLORS.textDim}>Configure watcher behavior and preferences</text>
      <box style={{ height: 1 }} />

      <Card title="Configuration">
        {FIELDS.map((field, i) => {
          const isFocused = focusedField === i;
          const isEditing = editingField === i;

          return (
            <box key={field.key} style={{ flexDirection: 'column', paddingBottom: 1 }}>
              {/* ── Field label row ── */}
              <box
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isFocused && !isEditing ? COLORS.surfaceHover : 'transparent',
                  paddingLeft: 1,
                }}
              >
                {/* Focus indicator */}
                <text fg={isFocused ? COLORS.primary : COLORS.textDim}>
                  {isFocused ? '>' : ' '}
                </text>

                {/* Field label */}
                <text fg={isEditing ? COLORS.warning : isFocused ? COLORS.primary : COLORS.text}>
                  {field.label}
                </text>

                <box style={{ flexGrow: 1 }} />

                {/* ── Edit mode rendering ── */}
                {isEditing && field.type === 'checkbox-list' ? null : (
                  isEditing ? (
                    field.type === 'dropdown' ? (
                      /* Dropdown: show arrow-wrapped option */
                      <box style={{ flexDirection: 'row', gap: 1 }}>
                        <text fg={COLORS.textDim}>◄</text>
                        <text fg={COLORS.info}>[{editValue}]</text>
                        <text fg={COLORS.textDim}>►</text>
                      </box>
                    ) : field.type === 'toggle' ? (
                      /* Toggle: show ON/OFF with highlight */
                      <text
                        fg={editValue === 'true' ? COLORS.success : COLORS.textDim}
                      >
                        [{editValue === 'true' ? 'ON' : 'OFF'}]
                      </text>
                    ) : field.type === 'number' ? (
                      /* Number: show cursor */
                      <text fg={COLORS.text}>
                        {editValue || '0'}<span fg={COLORS.primary}>_</span>
                      </text>
                    ) : (
                      /* Text: show cursor */
                      <text fg={COLORS.text}>
                        {editValue}<span fg={COLORS.primary}>_</span>
                      </text>
                    )
                  ) : (
                    /* ── View mode rendering ── */
                    <text
                      fg={
                        field.key === 'autoStart'
                          ? settings.autoStart
                            ? COLORS.success
                            : COLORS.textDim
                          : COLORS.info
                      }
                    >
                      {formatValue(field)}
                    </text>
                  )
                )}
              </box>

              {/* ── Checkbox list (rendered below the label row) ── */}
              {isEditing && field.type === 'checkbox-list' ? (
                <box style={{ flexDirection: 'column', paddingLeft: 4, paddingTop: 1 }}>
                  {checkboxItems.map((item, ci) => {
                    const isCursor = ci === checkboxCursor;
                    return (
                      <box
                        key={item.name}
                        style={{
                          flexDirection: 'row',
                          backgroundColor: isCursor ? COLORS.surfaceHover : 'transparent',
                        }}
                      >
                        <text fg={isCursor ? COLORS.primary : COLORS.textDim}>
                          {isCursor ? '>' : ' '}
                        </text>
                        <text fg={item.enabled ? COLORS.success : COLORS.textDim}>
                          [{item.enabled ? 'x' : ' '}]
                        </text>
                        <text fg={isCursor ? COLORS.text : COLORS.textMuted}>
                          {' '}{item.name}
                        </text>
                      </box>
                    );
                  })}
                </box>
              ) : null}

              {/* Description */}
              <box style={{ flexDirection: 'row', paddingLeft: 2 }}>
                <text fg={COLORS.textDim}>{field.description}</text>
                {isEditing && field.type === 'number' && (
                  <text fg={COLORS.textDim}>
                    {' '}({field.min}–{field.max})
                  </text>
                )}
              </box>
            </box>
          );
        })}
      </Card>

      {/* Help bar — context-aware */}
      <text fg={COLORS.textDim}>
        {editingField >= 0
          ? (() => {
              const ft = FIELDS[editingField].type;
              if (ft === 'checkbox-list') return '↑↓: navigate | Space: toggle | Enter: save | Esc: cancel';
              if (ft === 'number') return '0-9: type | Backspace: delete | Enter: save | Esc: cancel';
              if (ft === 'dropdown') return '◄►: choose option | Enter: save | Esc: cancel';
              if (ft === 'toggle') return 'Space/◄►: toggle | Enter: save | Esc: cancel';
              return 'Type to edit | Enter: save | Esc: cancel';
            })()
          : '↑↓: select field | Enter: edit | Esc: back to Dashboard'}
      </text>
    </box>
  );
}
