import React, { useState, useMemo, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../theme";
import { useTerminalDimensions } from "@opentui/react";
import { setState } from "../store/app-store";
import { startDaemon, stopDaemon, resetSession } from "../hooks/use-daemon";

const COMMANDS = [
  { id: "dashboard", label: "Go to Dashboard", action: () => setState({ view: "dashboard", commandPaletteOpen: false }) },
  { id: "events", label: "View Events", action: () => setState({ view: "events", commandPaletteOpen: false }) },
  { id: "diff", label: "View Diff", action: () => setState({ view: "diff", commandPaletteOpen: false }) },
  { id: "settings", label: "Open Settings", action: () => setState({ view: "settings", commandPaletteOpen: false }) },
  { id: "start", label: "Start Watch", action: () => { try { startDaemon(); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "stop", label: "Stop Watch", action: () => { try { stopDaemon(); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "reset", label: "Reset Session", action: () => { try { resetSession(); } catch {} setState({ commandPaletteOpen: false }); } },
  { id: "exit", label: "Exit KLAIR", action: () => process.exit(0) },
];

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { width } = useTerminalDimensions();

  const filtered = useMemo(
    () =>
      query
        ? COMMANDS.filter((c) =>
            c.label.toLowerCase().includes(query.toLowerCase())
          )
        : COMMANDS,
    [query]
  );

  useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

  useKeyboard((key) => {
    if (key.name === "escape") {
      setState({ commandPaletteOpen: false });
      return;
    }

    if (key.name === "return") {
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      return;
    }

    if (key.name === "down") {
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.name === "backspace") {
      setQuery((prev) => prev.slice(0, -1));
      return;
    }

    if (key.name === "space") {
      setQuery((prev) => prev + " ");
      return;
    }

    if (key.name.length === 1 && !key.ctrl && !key.meta) {
      setQuery((prev) => prev + key.name);
      setSelectedIndex(0);
    }
  });

  const left = Math.max(5, Math.floor((width - 40) / 2));
  const right = Math.max(5, Math.floor((width - 40) / 2));

  return (
    <box
      position="absolute"
      top={4}
      left={left}
      right={right}
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.accent}
      backgroundColor={theme.bgElevated}
      padding={1}
    >
      <box flexDirection="row" alignItems="center">
        <text fg={theme.accent}>
          /{" "}
        </text>
        <text fg={theme.text}>
          {query || "Type to search..."}
        </text>
      </box>
      <box flexDirection="column" marginTop={0}>
        {filtered.map((cmd, idx) => (
          <box
            key={cmd.id}
            paddingX={1}
            paddingY={0}
            backgroundColor={idx === selectedIndex ? theme.bgActive : undefined}
          >
            <text
              fg={idx === selectedIndex ? theme.accent : theme.textMuted}
            >
              {cmd.label}
            </text>
          </box>
        ))}
        {filtered.length === 0 && (
          <text fg={theme.textDim}>
            No commands found.
          </text>
        )}
      </box>
    </box>
  );
};
