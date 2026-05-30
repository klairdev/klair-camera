import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
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

export type AppAction =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'SET_SESSIONS'; sessions: Session[] }
  | { type: 'SET_ACTIVE_SESSION'; session: Session | null }
  | { type: 'SET_EVENTS'; events: FileEvent[] }
  | { type: 'SET_DASHBOARD_STATS'; stats: DashboardStats }
  | { type: 'SELECT_EVENT'; eventId: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_EDITING'; editing: boolean };

const initialState: AppState = {
  currentPage: 'dashboard',
  sessions: [],
  activeSession: null,
  events: [],
  dashboardStats: null,
  selectedEventId: null,
  loading: false,
  error: null,
  isEditing: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.sessions };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.session };
    case 'SET_EVENTS':
      return { ...state, events: action.events };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.stats };
    case 'SELECT_EVENT':
      return { ...state, selectedEventId: action.eventId };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_EDITING':
      return { ...state, isEditing: action.editing };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  return useContext(AppContext);
}
