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
  helpOpen: boolean;
  toastMessage: string | null;
  /** Focus index within the current view (for arrow-key navigation) */
  focusIndex: number;
  /** Max focusable elements in the current view */
  focusMax: number;
  /** Whether an input is being edited (blocks arrow nav) */
  editing: boolean;
  settings: {
    target: string;
    animate: boolean;
    verbose: boolean;
    autoScroll: boolean;
  };
}

const DEFAULT_SETTINGS = {
  target: process.cwd(),
  animate: true,
  verbose: false,
  autoScroll: true,
};

let state: AppState = {
  view: "dashboard",
  daemonRunning: false,
  daemonPid: null,
  targetDir: process.cwd(),
  events: [],
  selectedEvent: null,
  commandPaletteOpen: false,
  helpOpen: false,
  toastMessage: null,
  focusIndex: 0,
  focusMax: 0,
  editing: false,
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

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(message: string, durationMs = 2500): void {
  if (toastTimer) clearTimeout(toastTimer);
  setState({ toastMessage: message });
  toastTimer = setTimeout(() => {
    setState({ toastMessage: null });
    toastTimer = null;
  }, durationMs);
}

/** Set the focus context for a view — how many focusable elements, starting at index 0 */
export function setFocus(max: number): void {
  setState({ focusMax: max, focusIndex: Math.min(getState().focusIndex, max - 1) });
}

/** Move focus to next/prev element in the current view */
export function focusNext(): void {
  const s = getState();
  if (s.focusMax <= 0) return;
  setState({ focusIndex: (s.focusIndex + 1) % s.focusMax });
}

export function focusPrev(): void {
  const s = getState();
  if (s.focusMax <= 0) return;
  setState({ focusIndex: (s.focusIndex - 1 + s.focusMax) % s.focusMax });
}

/** Check if a given element index is focused */
export function isFocused(index: number): boolean {
  return getState().focusIndex === index && !getState().editing;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
