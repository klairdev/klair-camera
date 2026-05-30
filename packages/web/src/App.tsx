import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout';
import { Dashboard } from './pages/dashboard';
import { TimelinePage } from './pages/timeline';
import { DiffViewer } from './pages/diff-viewer';
import { Settings } from './pages/settings';
import { ToastContainer, createToast } from './components/toast';
import type { Toast } from './components/toast';
import type { FrameState } from './styles/theme';

type View = 'dashboard' | 'timeline' | 'diff' | 'settings';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [frameState, setFrameState] = useState<FrameState>('watching');

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const toast = createToast(type, message);
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => dismissToast(toast.id), 3000);
  }, [dismissToast]);

  const navigate = useCallback((v: string) => setView(v as View), []);
  const selectEvent = useCallback((id: number) => {
    setSelectedId(id);
    setView('diff');
    addToast('info', 'event #' + id + ' selected');
  }, [addToast]);
  const backFromDiff = useCallback(() => setView('timeline'), []);

  // Simulate state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameState((prev) => {
        const next: FrameState = prev === 'watching' ? 'analyzing' : prev === 'analyzing' ? 'verifying' : 'watching';
        return next;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key === '1') setView('dashboard');
      else if (e.key === '2') setView('timeline');
      else if (e.key === '3') setView('diff');
      else if (e.key === '4') setView('settings');
      else if (e.key === 'Escape') setView('dashboard');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const render = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'timeline':  return <TimelinePage onSelectEvent={selectEvent} />;
      case 'diff':      return <DiffViewer selectedEventId={selectedId} onBack={backFromDiff} />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeView={view} onNavigate={navigate} frameState={frameState}>
        {render()}
      </Layout>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default App;
