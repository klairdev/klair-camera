import { useState, useEffect, useCallback } from "react";
import { checkHealth, fetchEvents, type KlairEvent } from "../utils/api";
import { setState } from "../store/app-store";

const POLL_INTERVAL = 2000;

export function useDaemonStatus() {
  const [running, setRunning] = useState(false);
  const [pid, setPid] = useState<number | null>(null);

  const poll = useCallback(async () => {
    const healthy = await checkHealth();
    setRunning(healthy);
    if (healthy) {
      try {
        const res = await fetch("http://127.0.0.1:3928/health");
        const data = await res.json();
        setPid(data.pid ?? null);
      } catch {
        setPid(null);
      }
    } else {
      setPid(null);
    }
    setState({ daemonRunning: healthy, daemonPid: pid });
  }, [pid]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  return { running, pid, poll };
}

export function useEvents(limit = 20) {
  const [events, setEvents] = useState<KlairEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const poll = useCallback(async () => {
    const data = await fetchEvents(limit);
    setEvents(data);
    setLoading(false);
    setState({ events: data });
  }, [limit]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  return { events, loading, poll };
}
