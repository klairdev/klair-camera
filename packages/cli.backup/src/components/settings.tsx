import React, { useState, useEffect } from "react";
import { theme } from "../theme";
import { getState, setState, isFocused, setFocus, showToast } from "../store/app-store";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const TOGGLES = [
  { key: "animate", label: "Animate on new events", desc: "Show animation when events arrive" },
  { key: "verbose", label: "Verbose logging", desc: "Detailed operation info" },
  { key: "autoScroll", label: "Auto-scroll timeline", desc: "Scroll to newest event" },
] as const;

export const Settings: React.FC = () => {
  const [s, setS] = useState(getState().settings);
  const [target, setTarget] = useState(getState().settings.target);

  useEffect(() => { setFocus(TOGGLES.length + 2); }, []);

  const save = () => {
    const next = { ...s, target };
    setState({ settings: next });
    try {
      const p = path.join(os.homedir(), ".klair", "settings.json");
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(next, null, 2));
      showToast("Settings saved");
    } catch { showToast("Failed to save"); }
  };

  const toggle = (key: string) => {
    const next = { ...s, [key]: !(s as any)[key] };
    setS(next);
  };

  const focusBg = (focused: boolean) => focused ? theme.bgActive : "transparent";
  const focusBorder = (focused: boolean) => focused ? theme.accent : theme.border;
  const focusFg = (focused: boolean, base: string) => focused ? theme.accent : base;

  return (
    <box flexDirection="column" flexGrow={1} paddingX={3} paddingY={1} gap={2}>
      {/* Target directory */}
      <box flexDirection="column" borderStyle="single"
        borderColor={focusBorder(isFocused(0))}
        backgroundColor={focusBg(isFocused(0))}
      >
        <box paddingX={1} paddingY={0} backgroundColor={isFocused(0) ? theme.bgActive : theme.bgElevated}>
          <text fg={focusFg(isFocused(0), theme.textMuted)} bold>watch directory</text>
        </box>
        <box padding={2}>
          <text fg={isFocused(0) ? theme.accent : theme.textMuted}>target directory</text>
          <input
            value={target}
            onChange={setTarget}
            placeholder="~/projects/my-app"
            style={{ borderColor: isFocused(0) ? theme.accent : theme.border, color: theme.text }}
          />
          <text fg={theme.textDim}>the directory klair monitors for changes</text>
        </box>
      </box>

      {/* Behavior */}
      <box flexDirection="column" borderStyle="single" borderColor={theme.border}>
        <box paddingX={1} paddingY={0} backgroundColor={theme.bgElevated}>
          <text fg={theme.textMuted} bold>behavior</text>
        </box>
        <box padding={2} gap={1}>
          {TOGGLES.map((item, i) => {
            const idx = i + 1;
            const on = (s as any)[item.key];
            const focused = isFocused(idx);
            return (
              <box key={item.key} flexDirection="row" justifyContent="space-between" alignItems="center"
                paddingY={0} paddingX={1}
                borderStyle={focused ? "single" : undefined}
                borderColor={focused ? theme.accent : undefined}
                backgroundColor={focused ? theme.bgActive : "transparent"}
                onClick={() => toggle(item.key)}
              >
                <box flexDirection="column">
                  <text fg={focused ? theme.accent : theme.text}>{item.label}</text>
                  <text fg={theme.textDim}>{item.desc}</text>
                </box>
                <box borderStyle="single"
                  borderColor={on ? theme.success : (focused ? theme.accent : theme.border)}
                  paddingX={2} paddingY={0}
                  backgroundColor={on ? theme.diffAdded : (focused ? theme.bgActive : "transparent")}
                >
                  <text fg={on ? theme.success : (focused ? theme.accent : theme.textMuted)} bold>
                    {on ? "ON " : "OFF"}
                  </text>
                </box>
              </box>
            );
          })}
        </box>
      </box>

      {/* Actions */}
      <box flexDirection="row" gap={2}>
        <box borderStyle="single"
          borderColor={focusBorder(isFocused(TOGGLES.length + 1))}
          backgroundColor={focusBg(isFocused(TOGGLES.length + 1))}
          paddingX={3} paddingY={1} onClick={save}>
          <text fg={focusFg(isFocused(TOGGLES.length + 1), theme.success)} bold>
            {isFocused(TOGGLES.length + 1) ? "> " : "  "}save settings
          </text>
        </box>
        <box borderStyle="single"
          borderColor={focusBorder(isFocused(TOGGLES.length + 2))}
          backgroundColor={focusBg(isFocused(TOGGLES.length + 2))}
          paddingX={3} paddingY={1}
          onClick={() => {
            const def = { target: process.cwd(), animate: true, verbose: false, autoScroll: true };
            setS(def); setTarget(process.cwd());
          }}>
          <text fg={focusFg(isFocused(TOGGLES.length + 2), theme.textMuted)}>
            {isFocused(TOGGLES.length + 2) ? "> " : "  "}reset defaults
          </text>
        </box>
      </box>
    </box>
  );
};
