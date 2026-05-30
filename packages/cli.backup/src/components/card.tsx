import React from "react";
import { theme } from "../theme";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  borderColor?: string;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  borderColor = theme.border,
  padding = 2,
}) => (
  <box flexDirection="column" borderStyle="single" borderColor={borderColor}>
    {title && (
      <box paddingX={1} paddingY={0} backgroundColor={theme.bgElevated}>
        <text fg={theme.textMuted} bold>{title}</text>
      </box>
    )}
    <box padding={padding}>
      {children}
    </box>
  </box>
);
