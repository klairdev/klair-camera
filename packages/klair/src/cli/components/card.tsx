import type { ReactNode } from 'react';
import { COLORS } from '../styles/colors.js';

interface CardProps {
  title?: string;
  children?: ReactNode;
  accent?: string;
}

export function Card({ title, children, accent }: CardProps) {
  return (
    <box
      style={{
        border: true,
        borderColor: accent || COLORS.border,
        padding: 1,
        flexDirection: 'column',
        marginBottom: 1,
      }}
    >
      {title ? (
        <box style={{ border: false, paddingBottom: 1 }}>
          <text fg={accent || COLORS.primary}>
            <strong>{title}</strong>
          </text>
        </box>
      ) : null}
      {children}
    </box>
  );
}
