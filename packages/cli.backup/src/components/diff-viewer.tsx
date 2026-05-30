import React from "react";
import { theme } from "../theme";
import { getState, setState } from "../store/app-store";
import { Card } from "./card";

export const DiffViewer: React.FC = () => {
  const { selectedEvent } = getState();
  const evt = selectedEvent;

  if (!evt) {
    return (
      <box flexGrow={1} paddingX={3} paddingY={1} justifyContent="center" alignItems="center">
        <text fg={theme.textMuted}>select an event from the timeline to view its diff.</text>
      </box>
    );
  }

  const diff = evt.gitDiff || "";
  const adds = diff.split("\n").filter(l => l.startsWith("+") && !l.startsWith("+++")).length;
  const dels = diff.split("\n").filter(l => l.startsWith("-") && !l.startsWith("---")).length;

  return (
    <box flexDirection="column" flexGrow={1} paddingX={2} paddingY={1} gap={1}>
      {/* Header */}
      <Card title={evt.file.split("/").pop() || evt.file}>
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.textMuted}>#{evt.id} \u00B7 {evt.eventType} \u00B7 {new Date(evt.timestamp).toLocaleString()}</text>
          <box flexDirection="row" gap={1}>
            <text fg={theme.success}>+{adds}</text>
            <text fg={theme.accent}>\u2212{dels}</text>
          </box>
        </box>
      </Card>

      {/* Native OpenTUI diff component — split view, syntax highlighting, line numbers, scroll sync */}
      <box flexDirection="column" flexGrow={1} borderStyle="single" borderColor={theme.border}>
        {diff ? (
          <diff
            diff={diff}
            view="split"
            showLineNumbers
            syncScroll
            filetype="typescript"
            addedBg={theme.diffAdded}
            removedBg={theme.diffRemoved}
            addedSignColor={theme.success}
            removedSignColor={theme.accent}
          />
        ) : (
          <box flexGrow={1} padding={2} justifyContent="center" alignItems="center">
            <text fg={theme.textDim}>no diff captured for this event.</text>
          </box>
        )}
      </box>

      {/* Back */}
      <box borderStyle="single" borderColor={theme.border}
        paddingX={3} paddingY={1}
        onClick={() => setState({ view: "events", focusIndex: 0 })}>
        <text fg={theme.textMuted} bold> back to timeline</text>
      </box>
    </box>
  );
};
