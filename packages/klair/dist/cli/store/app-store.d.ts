import { type Dispatch, type ReactNode } from 'react';
import type { Session, FileEvent, DashboardStats } from '../../shared/types.js';
export type Page = 'dashboard' | 'timeline' | 'diff-viewer' | 'settings';
export interface AppState {
    currentPage: Page;
    sessions: Session[];
    activeSession: Session | null;
    events: FileEvent[];
    dashboardStats: DashboardStats | null;
    selectedEventId: string | null;
    loading: boolean;
    error: string | null;
    isEditing: boolean;
}
export type AppAction = {
    type: 'SET_PAGE';
    page: Page;
} | {
    type: 'SET_SESSIONS';
    sessions: Session[];
} | {
    type: 'SET_ACTIVE_SESSION';
    session: Session | null;
} | {
    type: 'SET_EVENTS';
    events: FileEvent[];
} | {
    type: 'SET_DASHBOARD_STATS';
    stats: DashboardStats;
} | {
    type: 'SELECT_EVENT';
    eventId: string | null;
} | {
    type: 'SET_LOADING';
    loading: boolean;
} | {
    type: 'SET_ERROR';
    error: string | null;
} | {
    type: 'SET_EDITING';
    editing: boolean;
};
interface AppContextValue {
    state: AppState;
    dispatch: Dispatch<AppAction>;
}
export declare function AppProvider({ children }: {
    children: ReactNode;
}): ReactNode;
export declare function useAppState(): AppContextValue;
export {};
//# sourceMappingURL=app-store.d.ts.map