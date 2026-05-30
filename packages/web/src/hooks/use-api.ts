import { useState, useEffect, useCallback } from 'react';
import { fetchStatus, fetchEvents } from '../utils/api';
import type { DaemonStatus, KlairEvent } from '../utils/api';

interface DaemonState {
  running: boolean;
  status: DaemonStatus | null;
  loading: boolean;
}

export function useDaemonStatus() {
  const [state, setState] = useState<DaemonState>({ running: false, status: null, loading: true });

  const poll = useCallback(async () => {
    const status = await fetchStatus();
    setState({ running: status.ok === true, status, loading: false });
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  return state;
}

interface EventsState {
  events: KlairEvent[];
  loading: boolean;
}

export function useEvents(limit = 50, offset = 0) {
  const [state, setState] = useState<EventsState>({ events: [], loading: true });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const events = await fetchEvents(limit, offset);
      if (active) setState({ events, loading: false });
    };
    load();
    const interval = setInterval(load, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [limit, offset]);

  return state;
}
