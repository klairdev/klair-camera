import { useAppState, type Page } from '../store/app-store.js';
import { COLORS } from '../styles/colors.js';

export function Header() {
  const { state, dispatch } = useAppState();

  const tabs: { key: Page; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'diff-viewer', label: 'Diff' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <box
      style={{
        height: 3,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      {/* Logo */}
      <text fg={COLORS.primary}>
        <strong>KLAIR</strong>
      </text>

      {/* Spacer */}
      <box style={{ flexGrow: 1 }} />

      {/* Tabs */}
      {tabs.map((tab, i) => (
        <box key={tab.key} style={{ paddingLeft: 1, paddingRight: 1 }}>
          <text
            fg={state.currentPage === tab.key ? COLORS.primary : COLORS.textMuted}
          >
            {state.currentPage === tab.key ? `[${tab.label}]` : ` ${tab.label} `}
          </text>
          <text fg={COLORS.textDim}> {String(i + 1)}</text>
        </box>
      ))}
    </box>
  );
}
