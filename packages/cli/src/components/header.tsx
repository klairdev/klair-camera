import React from "react";
import { theme } from "../theme";

interface HeaderProps {
  daemonRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ daemonRunning }) => {
  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      height={3}
      borderStyle="single"
      borderColor={theme.border}
      paddingX={2}
    >
      <box flexDirection="row" alignItems="center">
        <text fg={theme.cerulean} bold>
          KLAIR
        </text>
        <text fg={theme.textDim}>
          {" "}
          │{" "}
        </text>
        <text fg={theme.text}>
          Watch
        </text>
      </box>
      <box flexDirection="row" alignItems="center">
        <text
          fg={daemonRunning ? theme.success : theme.accent}
          bold
        >
          {daemonRunning ? "●" : "○"}
        </text>
        <text fg={theme.textMuted}>
          {" "}
          {daemonRunning ? "Active" : "Stopped"}
        </text>
      </box>
    </box>
  );
};
