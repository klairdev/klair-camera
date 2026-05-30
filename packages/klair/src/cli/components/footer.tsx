import { useAppState } from '../store/app-store.js';
import { COLORS } from '../styles/colors.js';

export function Footer() {
  const { state } = useAppState();
  const page = state.currentPage;

  const shortcuts: Record<string, string> = {
    dashboard: '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Navigate Enter:Select',
    timeline: '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Scroll Enter:View Diff',
    'diff-viewer': '1:Dashboard 2:Timeline 3:Diff 4:Settings ↑↓:Scroll Esc:Back',
    settings: '↑↓:Navigate Enter:Edit Esc:Back | 1-4:Switch tabs',
  };

  return (
    <box
      style={{
        height: 1,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      <text fg={COLORS.textDim}>{shortcuts[page] || 'Ctrl+Q:Quit'}</text>
      <box style={{ flexGrow: 1 }} />
      <text fg={COLORS.textMuted}>Ctrl+Q Quit</text>
    </box>
  );
}
