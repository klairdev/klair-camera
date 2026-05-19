import type { KlairEvent } from "../utils/api";

export type View = "dashboard" | "events" | "diff" | "settings";

export interface AppState {
  view: View;
  daemonRunning: boolean;
  daemonPid: number | null;
  targetDir: string;
  events: KlairEvent[];
  selectedEvent: KlairEvent | null;
  commandPaletteOpen: boolean;
  settings: {
    target: string;
    animate: boolean;
    verbose: boolean;
  };
}

const DEFAULT_SETTINGS = {
  target: process.cwd(),
  animate: true,
  verbose: false,
};

let state: AppState = {
  view: "dashboard",
  daemonRunning: false,
  daemonPid: null,
  targetDir: process.cwd(),
  events: [],
  selectedEvent: null,
  commandPaletteOpen: false,
  settings: DEFAULT_SETTINGS,
};

type Listener = (state: AppState) => void;
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function setState(partial: Partial<AppState>): void {
  state = { ...state, ...partial };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
