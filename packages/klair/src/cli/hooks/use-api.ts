import { useState, useCallback } from 'react';
import { DAEMON_URL } from '../../shared/constants.js';
import type { ApiResponse, Session, FileEvent, Diff, DashboardStats, KlairSettings } from '../../shared/types.js';

interface SessionInfo {
  id: string;
  name: string;
  path: string;
  startTime: string;
  status: string;
}

interface StatsData {
  sessions: number;
  events: number;
  uptime: number;
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${DAEMON_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) {
      throw new ApiError(json.error || 'Unknown API error');
    }
    return json.data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Failed to connect to daemon at ${DAEMON_URL}`);
  }
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError: () => setError(null),

    getStatus: () => call(() => fetchApi<{ running: boolean; activeSession: Session | null; sessionCount: number }>('/api/status')),
    getSessions: () => call(() => fetchApi<Session[]>('/api/sessions')),
    getActiveSession: () => call(() => fetchApi<Session | null>('/api/sessions/active')),
    getSession: (id: string) => call(() => fetchApi<Session>(`/api/sessions/${id}`)),
    createSession: (projectPath: string, name?: string) =>
      call(() =>
        fetchApi<Session>('/api/sessions', {
          method: 'POST',
          body: JSON.stringify({ projectPath, name }),
        })
      ),
    getEvents: (sessionId: string, limit = 100) =>
      call(() => fetchApi<FileEvent[]>(`/api/sessions/${sessionId}/events?limit=${limit}`)),
    getDiff: (eventId: string) => call(() => fetchApi<Diff | null>(`/api/events/${eventId}/diff`)),
    getDashboard: () => call(() => fetchApi<DashboardStats>('/api/dashboard')),
    getSettings: () => call(() => fetchApi<KlairSettings>('/api/settings')),
    updateSettings: (settings: Partial<KlairSettings>) =>
      call(() =>
        fetchApi<KlairSettings>('/api/settings', {
          method: 'PUT',
          body: JSON.stringify(settings),
        })
      ),
    postStop: () =>
      call(() =>
        fetchApi<{ message: string }>('/api/sessions/stop', { method: 'POST' })
      ),
    postReset: () =>
      call(() =>
        fetchApi<{ message: string }>('/api/sessions/reset', { method: 'POST' })
      ),
    getStats: () => call(() => fetchApi<StatsData>('/api/stats')),
    getSessionInfo: () => call(() => fetchApi<SessionInfo | null>('/api/session')),
    postRestartSession: (newPath: string) =>
      call(() =>
        fetchApi<SessionInfo>('/api/session/restart', {
          method: 'POST',
          body: JSON.stringify({ newPath }),
        })
      ),
  };
}
