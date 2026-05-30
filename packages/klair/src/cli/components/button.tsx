import { COLORS } from '../styles/colors.js';

interface ButtonProps {
  label: string;
  selected?: boolean;
  accent?: string;
}

export function Button({ label, selected, accent }: ButtonProps) {
  const borderColor = selected ? accent || COLORS.primary : COLORS.border;
  const bgColor = selected ? COLORS.surfaceHover : COLORS.surface;

  return (
    <box
      style={{
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
      }}
    >
      <text fg={selected ? (accent || COLORS.primary) : COLORS.text}>{label}</text>
    </box>
  );
}
