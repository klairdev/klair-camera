import { useEffect, useState } from 'react';

type Page = 'Dashboard' | 'Events' | 'Diff' | 'Ask Klair' | 'Settings';
type DaemonState = 'checking' | 'connected' | 'disconnected';

const pages: Page[] = ['Dashboard', 'Events', 'Diff', 'Ask Klair', 'Settings'];

function PixelMark() {
  return (
    <div className="pixel-mark" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

export default function App() {
  const [daemonState, setDaemonState] = useState<DaemonState>('checking');
  const [activePage, setActivePage] = useState<Page | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkDaemon() {
      try {
        const response = await fetch('http://localhost:4200/api/status');
        if (!cancelled) setDaemonState(response.ok ? 'connected' : 'disconnected');
      } catch {
        if (!cancelled) setDaemonState('disconnected');
      }
    }

    checkDaemon();
    return () => {
      cancelled = true;
    };
  }, []);

  const isConnected = daemonState === 'connected';

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <PixelMark />
          <div>
            <p className="eyebrow">Observing the Agent Era</p>
            <h1>KLAIR Web</h1>
          </div>
        </div>

        <div className={`daemon-status ${daemonState}`}>
          <span className="status-dot" />
          {daemonState === 'checking'
            ? 'Checking daemon'
            : isConnected
              ? 'Connected to daemon'
              : 'Disconnected'}
        </div>
      </header>

      <section className="hero">
        <p className="hero-kicker">See what your AI actually did.</p>
        <h2>Local-first observability for agent-written code.</h2>
        <p>
          This shell is the starting point for Klair’s browser UI: dashboard,
          timeline, diffs, settings, and eventually grounded “Ask Klair” answers.
        </p>
      </section>

      <nav className="nav" aria-label="KLAIR views">
        {pages.map((page) => (
          <button
            key={page}
            className={activePage === page ? 'active' : ''}
            type="button"
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>

      <section className="panel">
        {activePage ? (
          <>
            <p className="panel-label">Selected view</p>
            <h3>{activePage}</h3>
            <p>
              {activePage} is ready for Milestone 2 wiring. The shell is running;
              this placeholder will be replaced incrementally with real daemon data.
            </p>
          </>
        ) : (
          <>
            <p className="panel-label">Main area</p>
            <h3>Select a page above.</h3>
            <p>
              The app has loaded without requiring the daemon. If KLAIR is running,
              the status badge will show a live connection.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
