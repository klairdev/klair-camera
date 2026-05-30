import React, { useEffect, useState, useMemo } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { theme } from "../theme";
import { useEvents } from "../hooks/use-api";
import { setState, isFocused, setFocus } from "../store/app-store";
import { Card } from "./card";
import { Spinner } from "./spinner";

function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  return Math.floor(m / 60) + "h ago";
}
function shortPath(p: string, max = 30): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  let out = home && p.startsWith(home) ? "~" + p.slice(home.length) : p;
  return out.length > max ? "\u2026" + out.slice(-(max - 1)) : out;
}
function diffStats(diff: string): string {
  if (!diff) return "";
  const adds = diff.split("\n").filter(l => l.startsWith("+") && !l.startsWith("+++")).length;
  const dels = diff.split("\n").filter(l => l.startsWith("-") && !l.startsWith("---")).length;
  return adds || dels ? `+${adds} \u2212${dels}` : "";
}

const PAGE_SIZE = 15;

export const Events: React.FC = () => {
  const { width } = useTerminalDimensions();
  const narrow = width < 90;
  const { events, loading } = useEvents(200);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = events;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e => e.file.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") list = list.filter(e => e.eventType === typeFilter);
    return list;
  }, [events, query, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setFocus(Math.max(1, paged.length)); }, [paged]);

  const handleSelect = (evt: (typeof events)[0]) => {
    setState({ selectedEvent: evt, view: "diff", focusIndex: 0 });
  };

  if (loading) {
    return (
      <box flexGrow={1} paddingX={3} paddingY={1} justifyContent="center" alignItems="center">
        <Spinner />
      </box>
    );
  }

  return (
    <box flexDirection="column" flexGrow={1} paddingX={3} paddingY={1} gap={1}>
      {/* Search bar */}
      <box flexDirection="row" gap={1} alignItems="center">
        <text fg={theme.textDim}>search:</text>
        <input
          value={query}
          onChange={(v: string) => { setQuery(v); setPage(0); }}
          placeholder="filename..."
          style={{ borderColor: theme.border, color: theme.text }}
        />
        <text fg={theme.textDim}>type:</text>
        <select
          value={typeFilter}
          onChange={(v: string) => { setTypeFilter(v); setPage(0); }}
          options={[
            { value: "all", label: "all" },
            { value: "add", label: "create" },
            { value: "change", label: "modify" },
            { value: "unlink", label: "delete" },
          ]}
        />
        <text fg={theme.textDim}>{filtered.length} events</text>
      </box>

      {/* Event list */}
      <Card title={"timeline"}>
        <scrollbox flexGrow={1}>
          {paged.length === 0 ? (
            <text fg={theme.textMuted}>no events captured yet.</text>
          ) : (
            paged.map((evt, idx) => {
              const focused = isFocused(idx);
              const stats = diffStats(evt.gitDiff || "");
              return (
                <box key={evt.id} flexDirection="column" paddingX={1} paddingY={0}
                  backgroundColor={focused ? theme.bgActive : undefined}
                  onClick={() => handleSelect(evt)}
                >
                  <box flexDirection="row" gap={1}>
                    <text fg={focused ? theme.accent : theme.textDim}>
                      {focused ? "\u25B6" : " "} #{evt.id}
                    </text>
                    <text fg={theme.textMuted}>{ago(evt.timestamp)}</text>
                    <text fg={
                      evt.eventType === "add" ? theme.success :
                      evt.eventType === "unlink" ? theme.accent :
                      evt.eventType === "change" ? theme.cerulean : theme.text
                    }>{evt.eventType}</text>
                    <text fg={focused ? theme.text : theme.textMuted}>
                      {shortPath(evt.file, narrow ? 24 : 36)}
                    </text>
                  </box>
                  {stats && (
                    <box paddingLeft={3}>
                      <text fg={theme.textDim}>{stats}</text>
                    </box>
                  )}
                </box>
              );
            })
          )}
        </scrollbox>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <box flexDirection="row" justifyContent="center" gap={1}>
          <box borderStyle="single" borderColor={page === 0 ? theme.textDim : theme.border}
            paddingX={1} paddingY={0} onClick={() => setPage(Math.max(0, page - 1))}>
            <text fg={page === 0 ? theme.textDim : theme.textMuted}>prev</text>
          </box>
          <text fg={theme.textDim}>page {page + 1}/{totalPages} ({filtered.length} events)</text>
          <box borderStyle="single" borderColor={page >= totalPages - 1 ? theme.textDim : theme.border}
            paddingX={1} paddingY={0} onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>
            <text fg={page >= totalPages - 1 ? theme.textDim : theme.textMuted}>next</text>
          </box>
        </box>
      )}
    </box>
  );
};