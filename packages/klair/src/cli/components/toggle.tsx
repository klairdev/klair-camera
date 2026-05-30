import { COLORS } from '../styles/colors.js';

interface ToggleProps {
  value: boolean;
  label?: string;
  focused?: boolean;
}

export function Toggle({ value, label, focused }: ToggleProps) {
  return (
    <box style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {label ? (
        <text fg={COLORS.text}>{label}</text>
      ) : null}
      <box
        style={{
          width: 12,
          height: 1,
          border: true,
          borderColor: focused ? COLORS.primary : COLORS.border,
          backgroundColor: value ? COLORS.success : COLORS.surface,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: value ? 2 : 0,
          paddingRight: value ? 0 : 2,
        }}
      >
        <text fg={value ? COLORS.white : COLORS.textDim}>
          {value ? ' ON ' : ' OFF '}
        </text>
      </box>
    </box>
  );
}
