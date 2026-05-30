import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { createContext, useContext, useReducer } from 'react';
const initialState = {
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
function appReducer(state, action) {
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
const AppContext = createContext({
    state: initialState,
    dispatch: () => { },
});
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return _jsx(AppContext.Provider, { value: { state, dispatch }, children: children });
}
export function useAppState() {
    return useContext(AppContext);
}
//# sourceMappingURL=app-store.js.map