import type { Session, FileEvent, Diff, DashboardStats, KlairSettings } from '../../shared/types.js';
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
export declare function useApi(): {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    getStatus: () => Promise<{
        running: boolean;
        activeSession: Session | null;
        sessionCount: number;
    } | null>;
    getSessions: () => Promise<Session[] | null>;
    getActiveSession: () => Promise<Session | null>;
    getSession: (id: string) => Promise<Session | null>;
    createSession: (projectPath: string, name?: string) => Promise<Session | null>;
    getEvents: (sessionId: string, limit?: number) => Promise<FileEvent[] | null>;
    getDiff: (eventId: string) => Promise<Diff | null>;
    getDashboard: () => Promise<DashboardStats | null>;
    getSettings: () => Promise<KlairSettings | null>;
    updateSettings: (settings: Partial<KlairSettings>) => Promise<KlairSettings | null>;
    postStop: () => Promise<{
        message: string;
    } | null>;
    postReset: () => Promise<{
        message: string;
    } | null>;
    getStats: () => Promise<StatsData | null>;
    getSessionInfo: () => Promise<SessionInfo | null>;
    postRestartSession: (newPath: string) => Promise<SessionInfo | null>;
};
export {};
//# sourceMappingURL=use-api.d.ts.map