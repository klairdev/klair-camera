import { useState, useCallback } from 'react';
import { DAEMON_URL } from '../../shared/constants.js';
class ApiError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ApiError';
    }
}
async function fetchApi(path, options) {
    try {
        const res = await fetch(`${DAEMON_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const json = (await res.json());
        if (!json.success) {
            throw new ApiError(json.error || 'Unknown API error');
        }
        return json.data;
    }
    catch (err) {
        if (err instanceof ApiError)
            throw err;
        throw new ApiError(`Failed to connect to daemon at ${DAEMON_URL}`);
    }
}
export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const call = useCallback(async (fn) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return {
        loading,
        error,
        clearError: () => setError(null),
        getStatus: () => call(() => fetchApi('/api/status')),
        getSessions: () => call(() => fetchApi('/api/sessions')),
        getActiveSession: () => call(() => fetchApi('/api/sessions/active')),
        getSession: (id) => call(() => fetchApi(`/api/sessions/${id}`)),
        createSession: (projectPath, name) => call(() => fetchApi('/api/sessions', {
            method: 'POST',
            body: JSON.stringify({ projectPath, name }),
        })),
        getEvents: (sessionId, limit = 100) => call(() => fetchApi(`/api/sessions/${sessionId}/events?limit=${limit}`)),
        getDiff: (eventId) => call(() => fetchApi(`/api/events/${eventId}/diff`)),
        getDashboard: () => call(() => fetchApi('/api/dashboard')),
        getSettings: () => call(() => fetchApi('/api/settings')),
        updateSettings: (settings) => call(() => fetchApi('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        })),
        postStop: () => call(() => fetchApi('/api/sessions/stop', { method: 'POST' })),
        postReset: () => call(() => fetchApi('/api/sessions/reset', { method: 'POST' })),
        getStats: () => call(() => fetchApi('/api/stats')),
        getSessionInfo: () => call(() => fetchApi('/api/session')),
        postRestartSession: (newPath) => call(() => fetchApi('/api/session/restart', {
            method: 'POST',
            body: JSON.stringify({ newPath }),
        })),
    };
}
//# sourceMappingURL=use-api.js.map