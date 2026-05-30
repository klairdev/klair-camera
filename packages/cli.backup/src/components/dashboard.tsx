import React, { useEffect, useState } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { theme, progressBar } from "../theme";
import { KLAIR_LOGO } from "../utils/logo";
import { renderPixelLogo, renderPixelLogoCompact } from "../utils/logo-pixel";
import { useDaemonStatus, useEvents } from "../hooks/use-api";
import { startDaemon, stopDaemon, resetSession } from "../hooks/use-daemon";
import { getState, setState, isFocused, setFocus, showToast } from "../store/app-store";
import { Card } from "./card";

function shortPath(p: string, max = 36): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  let out = home && p.startsWith(home) ? "~" + p.slice(home.length) : p;
  return out.length > max ? "\u2026" + out.slice(-(max - 1)) : out;
}
function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  return Math.floor(m / 60) + "h ago";
}
function fmtUptime(ms: number): string {
  if (ms < 0) return "\u2014";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m " + (s % 60) + "s";
  const h = Math.floor(m / 60);
  return h + "h " + (m % 60) + "m";
}

interface ActionBtn {
  label: string;
  hint: string;
  action: string;
  color: string;
}

export const Dashboard: React.FC = () => {
  const { running, pid, poll } = useDaemonStatus();
  const { events } = useEvents(20);
  const { width, height } = useTerminalDimensions();
  const compact = height < 28 || width < 80;

  const actions: ActionBtn[] = [
    { label: running ? "stop capture" : "start capture", hint: "S", action: running ? "stop" : "start", color: running ? theme.accent : theme.success },
    { label: "reset session", hint: "R", action: "reset", color: theme.textMuted },
    { label: "settings", hint: "C", action: "settings", color: theme.textMuted },
    { label: "open gui", hint: "W", action: "gui", color: theme.cerulean },
  ];

  useEffect(() => { setFocus(actions.length); }, [actions.length]);

  const handle = (action: string) => {
    try {
      if (action === "start") { startDaemon(); showToast("capture started"); }
      else if (action === "stop") { stopDaemon(); showToast("capture stopped"); }
      else if (action === "reset") { resetSession(); showToast("session reset"); }
      else if (action === "settings") setState({ view: "settings", focusIndex: 0 });
      else if (action === "gui") { showToast("Web GUI coming soon in v1.1"); }
    } catch { /* */ }
    poll();
  };

  const [uptimeMs, setUptimeMs] = useState(0);
  useEffect(() => {
    if (running) {
      fetch("http://127.0.0.1:3928/status")
        .then(r => r.json()).then(d => { if (d.uptime) setUptimeMs(d.uptime); }).catch(() => {});
    }
  }, [running]);

  const eventRate = events.length > 0
    ? "~" + Math.max(1, Math.round(events.length / Math.max(1, (Date.now() - events[events.length - 1].timestamp) / 1000))) + "/sec"
    : "\u2014";

  const px = compact ? 2 : 4;
  const py = compact ? 0 : 1;
  const gap = compact ? 1 : 2;

  return (
    <box flexDirection="column" flexGrow={1} paddingX={px} paddingY={py} gap={gap}>
      {/* Hero area: centered logo + status */}
      <box flexDirection="column" alignItems="center" paddingY={1} gap={0}>
        <box flexDirection="column" alignItems="center">
          {(compact ? renderPixelLogoCompact() : renderPixelLogo()).map((line, i) => (
            <text key={i} fg={theme.accent}>{line}</text>
          ))}
        </box>
        <box flexDirection="row" alignItems="center" gap={1} marginTop={0}>
          <text fg={running ? theme.success : theme.textDim}>{running ? "\u25CF" : "\u25CB"}</text>
          <text fg={theme.cerulean}>watching {shortPath(getState().targetDir, 40)}</text>
          {pid && <text fg={theme.textDim}> pid {pid}</text>}
        </box>
      </box>

      {/* Session + Health cards */}
      {compact ? (
        <Card title="session">{/* Compact single-card layout */}
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>{fmtUptime(uptimeMs)}</text>
            <text fg={running ? theme.success : theme.textDim}>{running ? "active" : "stopped"}</text>
            <text fg={theme.textMuted}>pid {pid || "\u2014"}</text>
            <text fg={theme.textMuted}>{events.length} events</text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textDim}>cpu 0.3% {progressBar(3, 100, 6)}</text>
            <text fg={theme.textDim}>128MB {progressBar(12, 100, 6)}</text>
            <text fg={theme.textDim}>42ms</text>
            <text fg={theme.textDim}>{ago(events[0]?.timestamp || 0)}</text>
          </box>
        </Card>
      ) : (
        <box flexDirection="row" gap={2}>
          <box flexDirection="column" flexGrow={1}>
            <Card title="session">
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>elapsed</text><text fg={theme.cerulean}>{uptimeMs > 0 ? fmtUptime(uptimeMs) : "\u2014"}</text></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>events</text><text fg={theme.text}>{events.length} captured</text></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>rate</text><text fg={theme.cerulean}>{eventRate}</text></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>target</text><text fg={theme.text}>{shortPath(getState().targetDir)}</text></box>
            </Card>
          </box>
          <box flexDirection="column" flexGrow={1}>
            <Card title="health">
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>cpu</text><box flexDirection="row" gap={1}><text fg={theme.textDim}>{progressBar(3, 100, 16)}</text><text fg={theme.text}>0.3%</text></box></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>memory</text><box flexDirection="row" gap={1}><text fg={theme.textDim}>{progressBar(12, 100, 16)}</text><text fg={theme.text}>128 MB</text></box></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>latency</text><text fg={theme.text}>42 ms</text></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>last</text><text fg={theme.text}>{events.length > 0 ? ago(events[0].timestamp) : "\u2014"}</text></box>
              <box flexDirection="row" justifyContent="space-between"><text fg={theme.textMuted}>status</text><text fg={running ? theme.success : theme.textDim}>{running ? "active" : "stopped"}</text></box>
            </Card>
          </box>
        </box>
      )}

      {/* Quick Actions with keyboard hints */}
      <Card title="quick actions">
        <box flexDirection="row" gap={compact ? 1 : 2} flexWrap="wrap">
          {actions.map((btn, i) => {
            const focused = isFocused(i);
            return (
              <box key={btn.action}
                borderStyle="single"
                borderColor={focused ? theme.accent : theme.border}
                backgroundColor={focused ? theme.bgActive : "transparent"}
                paddingX={3} paddingY={1}
                onClick={() => handle(btn.action)}
              >
                <box flexDirection="row" gap={1} alignItems="center">
                  <text fg={theme.textDim} bold>{btn.hint}</text>
                  <text fg={focused ? theme.accent : btn.color} bold>
                    {btn.label}
                  </text>
                  {focused && <text fg={theme.accent}>{"\u25C0"}</text>}
                </box>
              </box>
            );
          })}
        </box>
      </Card>

      {/* Live event feed */}
      <Card title="recent activity">
        <scrollbox flexGrow={1}>
          {events.length === 0 ? (
            <box paddingX={2} paddingY={1}>
              <text fg={theme.textMuted}>no events yet. start watching to see changes.</text>
            </box>
          ) : (
            events.slice(0, 10).map((evt) => (
              <box key={evt.id} flexDirection="row" gap={1} paddingX={1} paddingY={0}>
                <text fg={theme.textDim}>#{evt.id}</text>
                <text fg={theme.textMuted}>{ago(evt.timestamp)}</text>
                <text fg={evt.eventType === "add" ? theme.success : evt.eventType === "unlink" ? theme.accent : theme.cerulean}>
                  {evt.eventType === "add" ? "create" : evt.eventType === "unlink" ? "delete" : evt.eventType}
                </text>
                <text fg={theme.text}>{shortPath(evt.file, compact ? 22 : 36)}</text>
              </box>
            ))
          )}
        </scrollbox>
      </Card>
    </box>
  );
};