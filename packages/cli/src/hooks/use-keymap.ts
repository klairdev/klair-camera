import { useKeyboard } from "@opentui/react";
import { getState, setState } from "../store/app-store";
import type { View } from "../store/app-store";

const VIEWS: View[] = ["dashboard", "events", "diff", "settings"];

export function useKeymap() {
  useKeyboard((key) => {
    if (getState().commandPaletteOpen) {
      return;
    }

    if (key.name === "q" && !key.ctrl) {
      process.exit(0);
    }

    if (key.name === "escape") {
      setState({ view: "dashboard", selectedEvent: null });
      return;
    }

    if (key.name === "up") {
      const idx = VIEWS.indexOf(getState().view);
      setState({ view: VIEWS[idx > 0 ? idx - 1 : VIEWS.length - 1] });
      return;
    }

    if (key.name === "down") {
      const idx = VIEWS.indexOf(getState().view);
      setState({ view: VIEWS[idx < VIEWS.length - 1 ? idx + 1 : 0] });
      return;
    }

    if (key.name === "k" && key.ctrl) {
      setState({ commandPaletteOpen: true });
      return;
    }

    if (key.name === "1") setState({ view: "dashboard" });
    if (key.name === "2") setState({ view: "events" });
    if (key.name === "3") setState({ view: "diff" });
    if (key.name === "4") setState({ view: "settings" });
  });
}
