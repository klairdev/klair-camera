import { useState, useEffect, useCallback, useRef } from 'react';
import { createInitialEvents, generateEvent, createSession, resetIdCounter } from '../utils/mock-data';
import type { KlairEvent, Session } from '../utils/mock-data';

interface EventsState {
  events: KlairEvent[];
  session: Session;
  loading: boolean;
}

const EVENTS_PER_PAGE = 20;

export function useEvents(initialCount = 247) {
  const [state, setState] = useState<EventsState>({
    events: [],
    session: createSession(),
    loading: true,
  });
  const countRef = useRef(initialCount);

  useEffect(() => {
    resetIdCounter();
    const initial = createInitialEvents(initialCount);
    setState({
      events: initial,
      session: { ...createSession(), eventCount: initial.length },
      loading: false,
    });
    countRef.current = initial.length;

    // Auto-generate new events every 3-5 seconds
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        const evt = generateEvent(countRef.current + 1);
        countRef.current = evt.id;
        setState((prev) => ({
          ...prev,
          events: [evt, ...prev.events],
          session: {
            ...prev.session,
            eventCount: prev.events.length + 1,
            latency: 30 + Math.floor(Math.random() * 40),
          },
        }));
        timerRef.current = schedule();
      }, delay);
    };

    const timerRef = { current: schedule() as ReturnType<typeof setTimeout> | null };

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialCount]);

  const getPage = useCallback((page: number) => {
    const start = page * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    return {
      events: state.events.slice(start, end),
      total: state.events.length,
      totalPages: Math.ceil(state.events.length / EVENTS_PER_PAGE),
    };
  }, [state.events]);

  const findEvent = useCallback((id: number) => {
    return state.events.find((e) => e.id === id) ?? null;
  }, [state.events]);

  return {
    ...state,
    getPage,
    findEvent,
    pageSize: EVENTS_PER_PAGE,
  };
}
