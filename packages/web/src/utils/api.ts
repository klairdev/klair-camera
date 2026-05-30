const API_BASE = 'http://127.0.0.1:3928';

export interface KlairEvent {
  id: number;
  timestamp: number;
  file: string;
  eventType: string;
  gitDiff: string | null;
}

export interface DaemonStatus {
  ok: boolean;
  running?: boolean;
  startedAt?: number;
  uptime?: number;
  watchRoot?: string;
  pid?: number | null;
  eventCount?: number;
}

export interface Settings {
  target: string | null;
  animate: boolean;
  streamOutput: boolean;
  verbose: boolean;
}

export async function fetchStatus(): Promise<DaemonStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) return { ok: false, running: false };
  return res.json();
}

export async function fetchEvents(limit = 50, offset = 0): Promise<KlairEvent[]> {
  const res = await fetch(`${API_BASE}/events?limit=${limit}&offset=${offset}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSettings(): Promise<Settings | null> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings | null> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
