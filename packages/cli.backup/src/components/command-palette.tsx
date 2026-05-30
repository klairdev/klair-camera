import React, { useState, useMemo, useEffect } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { theme } from "../theme";
import { setState, getState, showToast } from "../store/app-store";
import { startDaemon, stopDaemon, resetSession } from "../hooks/use-daemon";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const COMMANDS = [
  { id: "dashboard", label: "/dashboard",        action: () => setState({ view: "dashboard", commandPaletteOpen: false, focusIndex: 0 }) },
  { id: "events",    label: "/timeline",          action: () => setState({ view: "events",    commandPaletteOpen: false, focusIndex: 0 }) },
  { id: "diff",      label: "/diff",              action: () => setState({ view: "diff",      commandPaletteOpen: false, focusIndex: 0 }) },
  { id: "settings",  label: "/settings",           action: () => setState({ view: "settings",  commandPaletteOpen: false, focusIndex: 0 }) },
  { id: "start",     label: "/start",              action: () => { try { startDaemon(); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "stop",      label: "/stop",               action: () => { try { stopDaemon(); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "reset",     label: "/reset",              action: () => { try { resetSession(); showToast("session reset"); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "web",       label: "/web (coming soon)",   action: () => { showToast("Web GUI coming soon in v1.1"); setState({ commandPaletteOpen: false }); } },
  { id: "export",    label: "/export",             action: () => {
    try {
      const evts = getState().events;
      const json = JSON.stringify(evts, null, 2);
      const p = path.join(os.homedir(), ".klair", "trace-" + Date.now() + ".json");
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, json);
      showToast("\u2713 exported to ~/.klair/trace-*.json");
    } catch { showToast("\u2717 export failed"); }
    setState({ commandPaletteOpen: false });
  }},
  { id: "help",      label: "/help",              action: () => setState({ helpOpen: true, commandPaletteOpen: false }) },
  { id: "quit",      label: "/quit",              action: () => process.exit(0) },
];

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const { width, height } = useTerminalDimensions();

  const filtered = useMemo(() =>
    query ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase())) : COMMANDS,
    [query]
  );

  useEffect(() => { if (idx >= filtered.length) setIdx(Math.max(0, filtered.length - 1)); }, [filtered.length, idx]);

  useKeyboard((key) => {
    if (key.name === "escape") { setState({ commandPaletteOpen: false, helpOpen: false }); return; }
    if (key.name === "return") { filtered[idx]?.action(); return; }
    if (key.name === "up")     { setIdx((p: number) => p > 0 ? p - 1 : filtered.length - 1); return; }
    if (key.name === "down")   { setIdx((p: number) => p < filtered.length - 1 ? p + 1 : 0); return; }
    if (key.name === "backspace") { setQuery((p: string) => p.slice(0, -1)); return; }
    if (key.name === "space")  { setQuery((p: string) => p + " "); return; }
    if (key.name.length === 1 && !key.ctrl && !key.meta) { setQuery((p: string) => p + key.name); setIdx(0); }
  });

  const w = Math.min(50, width - 6);
  const left = Math.max(3, Math.floor((width - w) / 2));
  const vis = filtered.slice(0, Math.min(filtered.length, height - 7));

  return (
    <box position="absolute" top={3} left={left} width={w} flexDirection="column"
      borderStyle="single" borderColor={theme.accent} backgroundColor={theme.bgElevated}
      paddingX={2} paddingY={1}
    >
      <box flexDirection="row" alignItems="center" marginBottom={1}>
        <text fg={theme.accent} bold>/ </text>
        <text fg={theme.text}>{query || "type to search..."}</text>
      </box>
      <box flexDirection="column">
        {vis.map((cmd, i) => {
          const focused = i === idx;
          return (
            <box key={cmd.id} flexDirection="row" paddingX={1} paddingY={0} gap={2}
              backgroundColor={focused ? theme.bgActive : undefined}>
              <text fg={focused ? theme.accent : theme.textMuted} bold>
                {focused ? "\u25B6" : " "} {cmd.label}
              </text>
            </box>
          );
        })}
        {filtered.length === 0 && <text fg={theme.textDim}>no commands match</text>}
      </box>
      <box marginTop={0}>
        <text fg={theme.textDim}>\u2191\u2193 navigate \u00B7 enter select \u00B7 esc close</text>
      </box>
    </box>
  );
};

export const HelpOverlay: React.FC = () => {
  const { width } = useTerminalDimensions();
  const w = Math.min(48, width - 6);
  const left = Math.max(3, Math.floor((width - w) / 2));

  const sections: [string, string[]][] = [
    ["navigation", [
      "\u2191\u2193       move between items",
      "enter      select / activate",
      "esc        back / close",
    ]],
    ["pages", [
      "1          dashboard",
      "2          timeline",
      "3          diff viewer",
      "4          settings",
    ]],
    ["commands", [
      "/          command palette",
      "b / w      open web gui",
      "?          this help",
      "q          quit",
    ]],
    ["dashboard", [
      "s          stop capture",
      "r          reset session",
    ]],
  ];

  return (
    <box position="absolute" top={2} left={left} width={w} flexDirection="column"
      borderStyle="single" borderColor={theme.cerulean} backgroundColor={theme.bgElevated}
      paddingX={2} paddingY={1}
    >
      <box marginBottom={1}>
        <text fg={theme.cerulean} bold>keyboard shortcuts</text>
      </box>
      {sections.map(([title, lines]) => (
        <box key={title} flexDirection="column" marginBottom={0}>
          <text fg={theme.textDim} bold>{title}</text>
          {lines.map((line, i) => (
            <text key={i} fg={theme.textMuted}>  {line}</text>
          ))}
        </box>
      ))}
      <box marginTop={0}>
        <text fg={theme.textDim}>press ? or esc to close</text>
      </box>
    </box>
  );
};
