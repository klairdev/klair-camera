import React, { useState, useEffect } from "react";
import { Box, Text } from "@opentui/react";

const FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838"]; // ⠋ ⠙ ⠹ ⠸

interface SpinnerProps {
  label?: string;
  color?: string;
  interval?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ label, color = "#CEE7F3", interval = 100 }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <box flexDirection="row" alignItems="center" gap={1}>
      <text fg={color}>{FRAMES[frame]}</text>
      {label && <text fg={color}>{label}</text>}
    </box>
  );
};
