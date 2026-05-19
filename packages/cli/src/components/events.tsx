import React, { useState } from "react";
import { theme } from "../theme";
import { useEvents } from "../hooks/use-api";
import { setState } from "../store/app-store";

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function shortPath(p: string, maxLength = 25): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  let path = home && p.startsWith(home) ? "~" + p.slice(home.length) : p;
  if (path.length > maxLength) {
    return "…" + path.slice(-(maxLength - 1));
  }
  return path;
}

export const Events: React.FC = () => {
  const { events, loading } = useEvents(100);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = (evt: typeof events[0]) => {
    setState({ selectedEvent: evt, view: "diff" });
  };

  if (loading) {
    return (
      <box flexGrow={1} padding={1}>
        <text fg={theme.textMuted}>
          Loading events...
        </text>
      </box>
    );
  }

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={theme.cerulean} bold>
        Event Timeline
      </text>
      <scrollbox flexGrow={1} borderStyle="single" borderColor={theme.border} marginTop={0}>
        {events.length === 0 ? (
          <box padding={1}>
            <text fg={theme.textMuted}>
              No events captured yet.
            </text>
          </box>
        ) : (
          events.map((evt, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <box
                key={evt.id}
                paddingX={1}
                paddingY={0}
                backgroundColor={isSelected ? theme.bgActive : undefined}
                onClick={() => {
                  setSelectedIndex(idx);
                  handleSelect(evt);
                }}
              >
                <box flexDirection="row" justifyContent="space-between">
                  <box flexDirection="row">
                    <text fg={isSelected ? theme.accent : theme.textDim}>
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
              </box>
            );
          })
        )}
      </scrollbox>
    </box>
  );
};
