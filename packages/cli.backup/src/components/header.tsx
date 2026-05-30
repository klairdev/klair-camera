import React, { useState, useEffect } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { theme } from "../theme";
import { getState, setState, subscribe } from "../store/app-store";
import type { View } from "../store/app-store";

const TABS: { view: View; label: string; longLabel: string; key: string }[] = [
  { view: "dashboard", label: "dash", longLabel: "dashboard", key: "1" },
  { view: "events",    label: "time", longLabel: "timeline",  key: "2" },
  { view: "diff",      label: "diff", longLabel: "diff",      key: "3" },
  { view: "settings",  label: "sett", longLabel: "settings",  key: "4" },
];

export const Header: React.FC = () => {
  const [s, setS] = useState(getState());
  const { width } = useTerminalDimensions();
  const narrow = width < 80;

  useEffect(() => subscribe(setS), []);

  const running = s.daemonRunning;
  const pid = s.daemonPid;

  return (
    <box flexDirection="column" flexShrink={0}>
      {/* Brand bar */}
      <box flexDirection="row" justifyContent="space-between" alignItems="center"
        height={1} paddingX={2}
        backgroundColor={theme.bgElevated}
        borderStyle="single" borderColor={theme.border}
      >
        <box flexDirection="row" gap={1} alignItems="center">
          <text fg={theme.accent} bold>KLAIR</text>
          {!narrow && <text fg={theme.textDim}>/</text>}
          {!narrow && <text fg={theme.cerulean}>watch</text>}
        </box>
        <box flexDirection="row" gap={2} alignItems="center">
          {pid && <text fg={theme.textDim}>pid {pid}</text>}
          <text fg={running ? theme.success : theme.textDim}>{running ? "\u25CF" : "\u25CB"}</text>
          <text fg={running ? theme.success : theme.textDim}>{running ? "active" : "idle"}</text>
        </box>
      </box>

      {/* Tabs */}
      <box flexDirection="row" height={1} borderStyle="single" borderColor={theme.border}>
        {TABS.map((tab) => {
          const active = s.view === tab.view;
          const show = narrow ? tab.label : `${tab.key} ${tab.longLabel}`;
          return (
            <box key={tab.view} paddingX={narrow ? 1 : 3}
              backgroundColor={active ? theme.bgActive : undefined}
              onClick={() => setState({ view: tab.view, focusIndex: 0 })}
            >
              <text fg={active ? theme.accent : theme.textMuted} bold={active}>
                {show}
              </text>
            </box>
          );
        })}
        <box flexGrow={1} />
        {!narrow && (
          <box paddingX={1}>
            <text fg={theme.textDim}>
              {s.targetDir ? (s.targetDir.split("/").pop() || s.targetDir.split("\\").pop()) : ""}
            </text>
          </box>
        )}
      </box>
    </box>
  );
};
