import React from "react";
import { theme } from "../theme";

export const StatusBar: React.FC = () => {
  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      height={1}
      borderStyle="single"
      borderColor={theme.border}
      paddingX={2}
    >
      <text fg={theme.textDim}>
        Ctrl+K commands  1-4 views  navigate  Enter select  Esc back
      </text>
      <text fg={theme.textDim}>
        q quit
      </text>
    </box>
  );
};
