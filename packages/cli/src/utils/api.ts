const API_BASE = "http://127.0.0.1:3928";

export interface KlairEvent {
  id: number;
  timestamp: number;
  file: string;
  eventType: string;
  gitDiff: string;
}

export interface HealthResponse {
  ok: boolean;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = (await res.json()) as HealthResponse;
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function fetchEvents(limit = 20): Promise<KlairEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events?limit=${limit}`);
    return (await res.json()) as KlairEvent[];
  } catch {
    return [];
  }
}
