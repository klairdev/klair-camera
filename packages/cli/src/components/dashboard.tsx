import React from "react";
import { theme } from "../theme";
import { useDaemonStatus, useEvents } from "../hooks/use-api";
import { startDaemon, stopDaemon, resetSession } from "../hooks/use-daemon";
import { setState } from "../store/app-store";

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function shortPath(p: string, maxLength = 30): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  let path = home && p.startsWith(home) ? "~" + p.slice(home.length) : p;
  if (path.length > maxLength) {
    return "…" + path.slice(-(maxLength - 1));
  }
  return path;
}

export const Dashboard: React.FC = () => {
  const { running, pid, poll } = useDaemonStatus();
  const { events } = useEvents(5);
  const target = process.cwd();

  const handleStart = () => {
    try {
      startDaemon(target);
      poll();
    } catch (err) {
      console.error("Failed to start daemon:", err);
    }
  };

  const handleStop = () => {
    try {
      stopDaemon();
      poll();
    } catch (err) {
      console.error("Failed to stop daemon:", err);
    }
  };

  const handleReset = () => {
    try {
      resetSession();
      poll();
    } catch (err) {
      console.error("Failed to reset session:", err);
    }
  };

  const statusText = running ? "Active" : "Stopped";
  const statusColor = running ? theme.success : theme.accent;

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box flexDirection="column" marginBottom={1}>
        <text fg={theme.cerulean} bold>
          Session Status
        </text>
        <box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          padding={1}
          marginTop={0}
        >
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>Status</text>
            <text fg={statusColor} bold>
              {statusText}
            </text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>PID</text>
            <text fg={theme.text}>
              {pid ?? "—"}
            </text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>Target</text>
            <text fg={theme.text}>
              {shortPath(target)}
            </text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>API</text>
            <text fg={theme.text}>
              localhost:3928
            </text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.textMuted}>Events</text>
            <text fg={theme.text}>
              {events.length} captured
            </text>
          </box>
        </box>
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={theme.cerulean} bold>
          Recent Events
        </text>
        <box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          padding={1}
          marginTop={0}
        >
          {events.length === 0 ? (
            <text fg={theme.textMuted}>
              No events yet. Start watching to capture changes.
            </text>
          ) : (
            events.map((evt) => (
              <box key={evt.id} flexDirection="row" justifyContent="space-between">
                <box flexDirection="row">
                  <text fg={theme.textDim}>
                    #{evt.id}
                  </text>
                  <text fg={theme.textMuted}>
                    {" "}
                    {formatTime(evt.timestamp)}{" "}
                  </text>
                  <text
                    fg={
                      evt.eventType === "add"
                        ? theme.success
                        : evt.eventType === "unlink"
                          ? theme.accent
                          : theme.text
                    }
                  >
                    {evt.eventType}
                  </text>
                </box>
                <text fg={theme.text}>
                  {shortPath(evt.file)}
                </text>
              </box>
            ))
          )}
        </box>
      </box>

      <box flexDirection="row" gap={2}>
        {!running ? (
          <box
            borderStyle="single"
            borderColor={theme.success}
            paddingX={2}
            paddingY={0}
            onClick={handleStart}
          >
            <text fg={theme.success} bold>
              Start Watch
            </text>
          </box>
        ) : (
          <box
            borderStyle="single"
            borderColor={theme.accent}
            paddingX={2}
            paddingY={0}
            onClick={handleStop}
          >
            <text fg={theme.accent} bold>
              Stop
            </text>
          </box>
        )}
        <box
          borderStyle="single"
          borderColor={theme.textMuted}
          paddingX={2}
          paddingY={0}
          onClick={handleReset}
        >
          <text fg={theme.textMuted} bold>
            Reset
          </text>
        </box>
        <box
          borderStyle="single"
          borderColor={theme.textMuted}
          paddingX={2}
          paddingY={0}
          onClick={() => setState({ view: "settings" })}
        >
          <text fg={theme.textMuted} bold>
            Config
          </text>
        </box>
      </box>
    </box>
  );
};
