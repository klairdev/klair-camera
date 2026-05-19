import React from "react";
import { theme } from "../theme";
import { getState } from "../store/app-store";

function shortPath(p: string): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  if (home && p.startsWith(home)) {
    return "~" + p.slice(home.length);
  }
  return p;
}

export const DiffViewer: React.FC = () => {
  const { selectedEvent, events } = getState();
  const evt = selectedEvent ?? events[0] ?? null;

  if (!evt) {
    return (
      <box flexGrow={1} padding={1}>
        <text fg={theme.textMuted}>
          No diff to display. Select an event from the Events view.
        </text>
      </box>
    );
  }

  const lines = (evt.gitDiff || "No diff captured for this event.").split("\n");

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text fg={theme.cerulean} bold>
          Diff: {shortPath(evt.file)}
        </text>
        <text fg={theme.textDim}>
          #{evt.id} · {evt.eventType}
        </text>
      </box>
      <box
        flexDirection="column"
        flexGrow={1}
        borderStyle="single"
        borderColor={theme.border}
        padding={1}
        marginTop={0}
      >
        {lines.map((line, i) => {
          let fgColor = theme.text;
          if (line.startsWith("+") && !line.startsWith("+++")) {
            fgColor = theme.success;
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            fgColor = theme.accent;
          } else if (line.startsWith("@@")) {
            fgColor = theme.cerulean;
          } else if (line.startsWith("diff") || line.startsWith("index")) {
            fgColor = theme.textDim;
          }
          return (
            <text key={i} fg={fgColor}>
              {line}
            </text>
          );
        })}
      </box>
    </box>
  );
};
