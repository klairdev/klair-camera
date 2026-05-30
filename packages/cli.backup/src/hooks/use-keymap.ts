import { useKeyboard } from "@opentui/react";
import { getState, setState, showToast, focusNext, focusPrev } from "../store/app-store";
import { openWebGui, startDaemon, stopDaemon, resetSession } from "./use-daemon";

function isArrowUp(key: { name: string }): boolean {
  return key.name === "up" || key.name === "arrow_up" || key.name === "ArrowUp";
}
function isArrowDown(key: { name: string }): boolean {
  return key.name === "down" || key.name === "arrow_down" || key.name === "ArrowDown";
}

export function useKeymap() {
  useKeyboard((key) => {
    const s = getState();

    // Command palette / help overlays handled by their own components
    if (s.commandPaletteOpen || s.helpOpen) return;

    // Quit
    if (key.name === "q" && !key.ctrl) {
      exitGracefully();
    }

    // Ctrl+C → graceful exit
    if (key.name === "c" && key.ctrl) {
      exitGracefully();
    }

    // Escape → dashboard
    if (key.name === "escape") {
      setState({ view: "dashboard", selectedEvent: null, editing: false, focusIndex: 0 });
      return;
    }

    // Page jump
    if (key.name === "1") { setState({ view: "dashboard", focusIndex: 0 }); return; }
    if (key.name === "2") { setState({ view: "events",    focusIndex: 0 }); return; }
    if (key.name === "3") { setState({ view: "diff",      focusIndex: 0 }); return; }
    if (key.name === "4") { setState({ view: "settings",  focusIndex: 0 }); return; }

    // Help
    if (key.name === "?") { setState({ helpOpen: !s.helpOpen }); return; }

    // Command palette
    if (key.name === "/") { setState({ commandPaletteOpen: true }); return; }
    if (key.name === "k" && key.ctrl) { setState({ commandPaletteOpen: true }); return; }

    // Web GUI
    if (key.name === "b" || key.name === "w") {
      showToast("Opening http://localhost:3000");
      openWebGui();
      return;
    }

    // Arrow keys → focus navigation
    if (isArrowUp(key)) { focusPrev(); return; }
    if (isArrowDown(key)) { focusNext(); return; }

    // Enter → activate focused element
    if (key.name === "return") {
      const idx = s.focusIndex;
      const view = s.view;

      if (view === "dashboard") {
        const actions = s.daemonRunning
          ? ["stop", "reset", "settings", "gui"]
          : ["start", "reset", "settings", "gui"];
        const action = actions[idx];
        if (action === "start") { try { startDaemon(); } catch {} }
        else if (action === "stop") { try { stopDaemon(); } catch {} }
        else if (action === "reset") { try { resetSession(); } catch {}; showToast("session reset"); }
        else if (action === "settings") setState({ view: "settings", focusIndex: 0 });
        else if (action === "gui") { showToast("Opening http://localhost:3000"); openWebGui(); }
        return;
      }

      if (view === "events") {
        const evt = s.events[idx];
        if (evt) setState({ selectedEvent: evt, view: "diff", focusIndex: 0 });
        return;
      }

      if (view === "diff") {
        setState({ view: "events", focusIndex: 0 });
        return;
      }

      if (view === "settings") {
        switch (idx) {
          case 0: setState({ settings: { ...s.settings, animate: !s.settings.animate } }); break;
          case 1: setState({ settings: { ...s.settings, verbose: !s.settings.verbose } }); break;
          case 2: setState({ settings: { ...s.settings, autoScroll: !s.settings.autoScroll } }); break;
          case 3: saveSettingsFn(); showToast("settings saved"); break;
        }
        return;
      }
    }
  });
}

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

function saveSettingsFn() {
  const { settings } = getState();
  try {
    const p = path.join(os.homedir(), ".klair", "settings.json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(settings, null, 2));
  } catch { /* */ }
}

function exitGracefully() {
  try {
    const s = getState();
    if (s.daemonPid) {
      if (process.platform === "win32") {
        execSync(`taskkill /F /PID ${s.daemonPid}`, { stdio: "ignore" });
      } else {
        process.kill(s.daemonPid, "SIGTERM");
      }
    }
  } catch { /* already gone */ }
  process.exit(0);
}
