export interface Session {
    id: string;
    projectPath: string;
    name: string;
    startedAt: string;
    lastActiveAt: string;
    status: 'active' | 'paused' | 'stopped';
}
export interface FileEvent {
    id: string;
    sessionId: string;
    filePath: string;
    eventType: 'created' | 'modified' | 'deleted';
    timestamp: string;
    diffId?: string;
}
export interface Diff {
    id: string;
    eventId: string;
    content: string;
    filePath: string;
    linesAdded: number;
    linesRemoved: number;
}
export interface KlairSettings {
    watchDebounceMs: number;
    maxEventsPerSession: number;
    ignorePatterns: string[];
    theme: 'dark' | 'light';
    autoStart: boolean;
}
export interface DashboardStats {
    totalSessions: number;
    totalEvents: number;
    activeSession: Session | null;
    recentEvents: FileEvent[];
    topFiles: {
        path: string;
        count: number;
    }[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map