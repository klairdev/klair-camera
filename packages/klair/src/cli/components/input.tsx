import { COLORS } from '../styles/colors.js';

interface InputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
  label?: string;
}

export function Input({ value, placeholder, focused, label }: InputProps) {
  const displayValue = value || placeholder || '';
  const fg = value ? COLORS.text : COLORS.textDim;

  return (
    <box style={{ flexDirection: 'column' }}>
      {label ? (
        <text fg={COLORS.textMuted}>{label}</text>
      ) : null}
      <box
        style={{
          border: true,
          borderColor: focused ? COLORS.primary : COLORS.border,
          backgroundColor: focused ? COLORS.surfaceHover : COLORS.surface,
          paddingLeft: 1,
          paddingRight: 1,
          height: 3,
          alignItems: 'center',
        }}
      >
        <text fg={fg}>
          {displayValue}
          {focused ? <span fg={COLORS.primary}>_</span> : null}
        </text>
      </box>
    </box>
  );
}
