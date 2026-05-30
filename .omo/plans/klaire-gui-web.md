# KLAIR Web GUI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based GUI for KLAIR that replaces the OpenTUI TUI as the primary user interface, with 4 views (Dashboard, Events, Diff, Settings) powered by the existing daemon API.

**Architecture:** New `packages/web` workspace with Vite + React 19 + TypeScript + Tailwind CSS v3 + Framer Motion. Serves as SPA, polls `localhost:3928` daemon API every 2s. Daemon API gets CORS support and new endpoints for status/settings/pagination. Monorepo updated to include 3rd workspace.

**Tech Stack:** Vite 6, React 19, TypeScript 5.7, Tailwind CSS 3.4, Framer Motion 11, PostCSS, Autoprefixer. Daemon: Express 5, `node:sqlite`.

---

## Context

### Current State
- `packages/daemon` — Express server on `:3928` with `GET /health` and `GET /events?limit=N`
- `packages/cli` — Node.js CLI wrapper + Bun/OpenTUI TUI
- Daemon stores events in SQLite at `~/.klair/camera.db`
- Daemon state at `~/.klair/camera.state.json`
- Settings at `~/.klair/settings.json`

### New Package: `packages/web`
Vite SPA with proxy to daemon during development. No production server — built files served by daemon in future. For MVP, Vite dev server on `:3000` proxies API calls to `:3928`.

### Daemon API Additions
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/status` | Daemon uptime, event count, watch root, PID |
| `GET` | `/settings` | Read `~/.klair/settings.json` |
| `PUT` | `/settings` | Write `~/.klair/settings.json` |
| `GET` | `/events?offset=N` | Add offset param for pagination |

Plus: CORS middleware, max limit 100→1000.

---

## Work Objectives

### Core Objective
Ship KLAIR Web GUI v0.1 — 4-view SPA with live polling, diff display, and settings management.

### Must Have
- Layout shell (header, sidebar nav, footer) working in browser
- Dashboard showing session status + recent events
- Events timeline scrollable list, clickable to view diff
- Diff viewer rendering git diffs with side-by-side layout
- Settings page reading/writing `~/.klair/settings.json` via daemon API
- Live 2s polling from daemon
- Brand colors applied: Tuscan Red `#A91B18`, Pale Cerulean `#CEE7F3`, Noir `#181717`, Satin Linen `#F8FAED`
- Keyboard shortcuts: `1-4` for views, `q` quit (dev server)
- CORS support in daemon for cross-origin requests

### Must NOT Have
- No authentication/authorization
- No user accounts or team features
- No search/filter (future)
- No export functionality
- No tests (MVP — user opted out)
- No production static serving from daemon (future)

---

## Verification Strategy

> All verification is agent-executed. Every task includes browser-based QA scenarios.

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Web/UI**: Playwright — navigate, interact, assert DOM, screenshot
- **API**: Bash (curl) — send requests, assert status + JSON body
- **Hot-reload**: Vite dev server must pick up changes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — fully parallel):
├── Task 1: Scaffold packages/web (Vite + React + TS + Tailwind + Framer Motion)
├── Task 2: Daemon — CORS middleware
├── Task 3: Daemon — GET /status endpoint
├── Task 4: Daemon — GET/PUT /settings endpoints
├── Task 5: Daemon — GET /events pagination (offset) + limit increase

Wave 2 (Web Foundation — parallel):
├── Task 6: Web — CSS theme + Tailwind config + index.css
├── Task 7: Web — API client + hooks (use-api, use-events)
├── Task 8: Web — Layout shell (header + sidebar + footer)
├── Task 9: Web — Status indicator component + animations helpers

Wave 3 (Web Views — parallel):
├── Task 10: Web — Dashboard page
├── Task 11: Web — Events timeline page + event-card component
├── Task 12: Web — Diff viewer page + diff-panel component
├── Task 13: Web — Settings page
├── Task 14: Web — App.tsx root wiring + view routing

Wave FINAL (4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: TypeScript build check + Vite dev server smoke test
├── F3: Real manual QA (Playwright scenarios)
└── F4: Scope fidelity check
    → Present results → Get explicit user okay
```

### Dependency Matrix
- **1-5**: Independently parallel (daemon and web packages unrelated)
- **6-9**: Depend on 1 (scaffold must exist)
- **10-14**: Depend on 6-9 (CSS, hooks, layout must exist)
- **F1-F4**: Depend on all tasks

### Agent Dispatch Summary
- **Wave 1**: 5 agents — T1→`quick`, T2→`quick`, T3→`unspecified-low`, T4→`unspecified-low`, T5→`unspecified-low`
- **Wave 2**: 4 agents — T6→`visual-engineering`, T7→`unspecified-high`, T8→`visual-engineering`, T9→`visual-engineering`
- **Wave 3**: 5 agents — T10→`visual-engineering`, T11→`visual-engineering`, T12→`visual-engineering`, T13→`unspecified-high`, T14→`deep`
- **Final**: 4 agents — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high` (+ playwright), F4→`deep`

---

## TODOs

- [ ] 1. Scaffold `packages/web` (Vite + React 19 + TS + Tailwind + Framer Motion)

  **What to do**:
  - Create `packages/web/` directory
  - Create `packages/web/package.json` with all dependencies
  - Create `packages/web/tsconfig.json` targeting ESNext with JSX react-jsx
  - Create `packages/web/vite.config.ts` with React plugin and proxy `/api` → `http://127.0.0.1:3928`
  - Create `packages/web/index.html` as SPA entry
  - Create `packages/web/postcss.config.js`
  - Create `packages/web/tailwind.config.ts` with brand colors as `extend.colors`
  - Create `packages/web/src/styles/index.css` with Tailwind directives + brand CSS custom properties
  - Create `packages/web/src/main.tsx` — minimal React root render
  - Create `packages/web/src/vite-env.d.ts` — Vite type reference
  - Create `packages/web/src/styles/theme.ts` — brand color constants (matches `packages/cli/src/theme.ts`)
  - Update root `package.json` — add `"packages/web"` to workspaces array
  - Run `npm install` at monorepo root

  **Must NOT do**:
  - Do NOT install global tooling — everything lives in devDependencies
  - Do NOT create any components or pages yet — scaffold only
  - Do NOT add routing libraries — SPA uses state-based view switching

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Scaffolding is repetitive file-creation work with well-known patterns
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — no specialized skills needed for boilerplate

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 6, 7, 8, 9 (web foundation requires scaffold)
  - **Blocked By**: None

  **References**:
  - `packages/daemon/package.json` — Follow existing monorepo workspace pattern
  - `packages/cli/tsconfig.json` — Mirror TypeScript config patterns
  - Vite docs: `https://vite.dev/guide/#scaffolding-your-first-vite-project`

  **Acceptance Criteria**:
  - [ ] `packages/web/package.json` exists with all deps
  - [ ] `packages/web/src/main.tsx` exists and imports `App`
  - [ ] `npm install` succeeds at root
  - [ ] `npx tsc --noEmit` passes in `packages/web`

  **QA Scenarios**:
  ```
  Scenario: Vite dev server starts
    Tool: Bash
    Preconditions: packages/web exists, npm install completed
    Steps:
      1. cd packages/web && npx vite --port 3000 &
         Wait 5s
      2. curl -s http://localhost:3000 | head -20
    Expected Result: HTML response contains <div id="root">
    Failure Indicators: Connection refused, vite command not found
    Evidence: .omo/evidence/task-1-vite-start.txt

  Scenario: TypeScript compiles
    Tool: Bash
    Preconditions: packages/web exists
    Steps:
      1. cd packages/web && npx tsc --noEmit
    Expected Result: Exit code 0, no type errors
    Evidence: .omo/evidence/task-1-tsc-check.txt
  ```

  **Commit**: YES
  - Message: `feat(web): scaffold Vite + React + Tailwind project`
  - Files: `packages/web/*`, `package.json`
  - Pre-commit: `cd packages/web && npx tsc --noEmit`

- [ ] 2. Daemon — Add CORS middleware

  **What to do**:
  - Edit `packages/daemon/src/api.js` to add a manual CORS middleware before all routes
  - The middleware must set `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
  - Handle OPTIONS preflight requests with 204 No Content
  - Do NOT add the `cors` npm package — use a manual handler to avoid dependency

  **Must NOT do**:
  - Do NOT add `cors` to dependencies
  - Do NOT expose the server to non-localhost (still bind to 127.0.0.1)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file, well-understood pattern, 10-minute change
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — too simple for specialized skills

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Task 7 (API client needs CORS to work)
  - **Blocked By**: None

  **References**:
  - `packages/daemon/src/api.js:1-25` — Existing Express app setup, middleware goes BEFORE routes

  **Acceptance Criteria**:
  - [ ] `curl -s -D- http://localhost:3928/health | head -20` includes `Access-Control-Allow-Origin: *`
  - [ ] OPTIONS preflight returns 204

  **QA Scenarios**:
  ```
  Scenario: CORS headers present
    Tool: Bash (curl)
    Preconditions: Daemon is running on :3928
    Steps:
      1. curl -s -D- http://localhost:3928/health
    Expected Result: Response headers include Access-Control-Allow-Origin: *
    Failure Indicators: No CORS headers, daemon not running
    Evidence: .omo/evidence/task-2-cors-headers.txt

  Scenario: OPTIONS preflight handled
    Tool: Bash (curl)
    Preconditions: Daemon running
    Steps:
      1. curl -s -D- -X OPTIONS http://localhost:3928/health
    Expected Result: HTTP 204 No Content, CORS headers present
    Evidence: .omo/evidence/task-2-cors-preflight.txt
  ```

  **Commit**: YES
  - Message: `feat(daemon): add CORS middleware`
  - Files: `packages/daemon/src/api.js`
  - Pre-commit: `node --check packages/daemon/src/api.js`

- [ ] 3. Daemon — Add `GET /status` endpoint

  **What to do**:
  - Add `countEvents` function to `packages/daemon/src/database.js`:
    ```js
    export function countEvents(db) {
      const stmt = db.prepare('SELECT COUNT(*) AS count FROM events');
      return stmt.get().count;
    }
    ```
  - Add `GET /status` route to `packages/daemon/src/api.js`:
    ```js
    app.get('/status', (_req, res) => {
      try {
        const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
        const pid = parseInt(fs.readFileSync(PID_PATH, 'utf8'), 10);
        const count = countEvents(db);
        res.json({
          ok: true,
          startedAt: state.startedAt,
          uptime: Date.now() - state.startedAt,
          watchRoot: state.watchRoot,
          pid: Number.isFinite(pid) ? pid : null,
          eventCount: count,
        });
      } catch {
        res.json({ ok: false, running: false });
      }
    });
    ```
  - Add imports at top of `api.js`: `import fs from 'node:fs'`, `import { STATE_PATH, PID_PATH } from './paths.js'`, import `countEvents` from database
  - Catch `MODULE_NOT_FOUND` for paths imports gracefully if daemon dir state is missing

  **Must NOT do**:
  - Do NOT add CPU usage metrics (not available without extra deps)
  - Do NOT expose any filesystem paths outside `~/.klair/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Simple Express route + database query, well-defined scope
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — standard pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Task 7, 10 (dashboard uses status data)
  - **Blocked By**: None

  **References**:
  - `packages/daemon/src/database.js:32-40` — Existing `getLastEvents` function pattern
  - `packages/daemon/src/paths.js:1-13` — STATE_PATH, PID_PATH constants
  - `packages/daemon/src/api.js:9-17` — Existing route pattern (GET /health, GET /events)

  **Acceptance Criteria**:
  - [ ] `curl -s http://localhost:3928/status` returns JSON with `ok`, `startedAt`, `uptime`, `watchRoot`, `pid`, `eventCount`
  - [ ] When daemon not fully initialized, returns `{ ok: false, running: false }`

  **QA Scenarios**:
  ```
  Scenario: Status endpoint returns daemon info
    Tool: Bash (curl)
    Preconditions: Daemon running with active watcher
    Steps:
      1. curl -s http://localhost:3928/status
    Expected Result: JSON { ok: true, startedAt: number, uptime: number, watchRoot: string, pid: number, eventCount: number }
    Failure Indicators: 404, 500, missing fields
    Evidence: .omo/evidence/task-3-status-ok.txt

  Scenario: Status when daemon not ready
    Tool: Bash (curl)
    Preconditions: Daemon running but state not written (or simulate)
    Steps:
      1. curl -s http://localhost:3928/status
    Expected Result: JSON with ok: false on error
    Evidence: .omo/evidence/task-3-status-error.txt
  ```

  **Commit**: YES (group with Task 4, 5)
  - Message: `feat(daemon): add /status and /settings endpoints with pagination`
  - Files: `packages/daemon/src/api.js`, `packages/daemon/src/database.js`
  - Pre-commit: `node --check packages/daemon/src/api.js`

- [ ] 4. Daemon — Add `GET/PUT /settings` endpoints

  **What to do**:
  - Add `GET /settings` route to `api.js`:
    ```js
    import { loadSettings, saveSettings } from './settings.js';
    
    app.get('/settings', (_req, res) => {
      res.json(loadSettings());
    });
    ```
  - Add `PUT /settings` route to `api.js`:
    ```js
    app.put('/settings', (req, res) => {
      const body = JSON.stringify(req.body); // or raw body parsing
      const updated = saveSettings(req.body || {});
      res.json(updated);
    });
    ```
  - Express 5 has built-in `express.json()` middleware — enable it:
    ```js
    app.use(express.json());
    ```
  - Import `loadSettings, saveSettings` from `./settings.js`

  **Must NOT do**:
  - Do NOT validate settings fields (MVP — trust frontend)
  - Do NOT expose `SETTINGS_PATH` or internal paths

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Standard Express read/write endpoints, well-trodden path
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — pattern is trivial

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Task 13 (settings page)
  - **Blocked By**: None

  **References**:
  - `packages/daemon/src/settings.js:1-28` — `loadSettings()`, `saveSettings()` functions
  - `packages/daemon/src/api.js:5-8` — `app.disable('x-powered-by')`, middleware setup pattern

  **Acceptance Criteria**:
  - [ ] `curl -s http://localhost:3928/settings` returns JSON object
  - [ ] `curl -s -X PUT -H 'Content-Type: application/json' -d '{"verbose":true}' http://localhost:3928/settings` returns updated settings

  **QA Scenarios**:
  ```
  Scenario: GET settings returns current config
    Tool: Bash (curl)
    Preconditions: Daemon running
    Steps:
      1. curl -s http://localhost:3928/settings
    Expected Result: JSON with fields: target, animate, streamOutput, verbose
    Failure Indicators: 404, 500, empty response
    Evidence: .omo/evidence/task-4-get-settings.txt

  Scenario: PUT settings updates and returns new config
    Tool: Bash (curl)
    Preconditions: Daemon running
    Steps:
      1. curl -s -X PUT -H 'Content-Type: application/json' -d '{"verbose":true,"animate":false}' http://localhost:3928/settings
      2. curl -s http://localhost:3928/settings
    Expected Result: Second call returns { verbose: true, animate: false, ... }
    Failure Indicators: Settings not persisted, 500 error
    Evidence: .omo/evidence/task-4-put-settings.txt
  ```

  **Commit**: YES (group with Task 3, 5)

- [ ] 5. Daemon — Add offset pagination to `GET /events`

  **What to do**:
  - Modify `getLastEvents` in `packages/daemon/src/database.js` to accept offset:
    ```js
    export function getLastEvents(db, limit = 10, offset = 0) {
      const stmt = db.prepare(
        `SELECT id, timestamp, file, event_type AS eventType, git_diff AS gitDiff
         FROM events
         ORDER BY timestamp DESC, id DESC
         LIMIT ? OFFSET ?`
      );
      return stmt.all(limit, offset);
    }
    ```
  - Update `GET /events` in `api.js` to parse `offset` query param:
    ```js
    app.get('/events', (req, res) => {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 1000);
      const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
      res.json(getLastEvents(db, limit, offset));
    });
    ```
  - Increase max limit from 100 to 1000

  **Must NOT do**:
  - Do NOT change the event schema
  - Do NOT add sorting options (descending only, by timestamp)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Tiny SQL change + query param parsing
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Task 11 (events timeline uses pagination)
  - **Blocked By**: None

  **References**:
  - `packages/daemon/src/database.js:32-40` — Current `getLastEvents` function
  - `packages/daemon/src/api.js:13-17` — Current events route handler

  **Acceptance Criteria**:
  - [ ] `curl -s 'http://localhost:3928/events?limit=5&offset=0'` returns events
  - [ ] `curl -s 'http://localhost:3928/events?limit=5&offset=5'` returns next page (different results)
  - [ ] Limit up to 1000 works

  **QA Scenarios**:
  ```
  Scenario: Events with offset returns different page
    Tool: Bash (curl)
    Preconditions: Daemon has 10+ events in database
    Steps:
      1. curl -s 'http://localhost:3928/events?limit=3&offset=0' > page1.json
      2. curl -s 'http://localhost:3928/events?limit=3&offset=3' > page2.json
    Expected Result: page1.json and page2.json return different event IDs
    Failure Indicators: Same results, empty array, 500
    Evidence: .omo/evidence/task-5-offset-compare.txt
  ```

  **Commit**: YES (group with Task 3, 4)

- [ ] 6. Web — Add Tailwind theme with brand colors and CSS

  **What to do**:
  - Create `packages/web/tailwind.config.ts` (if not created in Task 1, otherwise update it):
    ```ts
    import type { Config } from 'tailwindcss';

    export default {
      content: ['./index.html', './src/**/*.{ts,tsx}'],
      theme: {
        extend: {
          colors: {
            primary: '#A91B18',
            secondary: '#CEE7F3',
            dark: '#181717',
            background: '#F8FAED',
            'primary-hover': '#8a1512',
            'text-muted': '#787D6E',
            'border': '#E5E7EB',
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            DEFAULT: '8px',
          },
          spacing: {
            'grid': '8px',
          },
        },
      },
      plugins: [],
    } satisfies Config;
    ```
  - Create `packages/web/postcss.config.js` (if not created in Task 1):
    ```js
    export default {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    ```
  - Create `packages/web/src/styles/index.css`:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    :root {
      --color-primary: #A91B18;
      --color-secondary: #CEE7F3;
      --color-dark: #181717;
      --color-background: #F8FAED;
      --color-text: #1a1a1a;
      --color-text-muted: #787D6E;
    }

    body {
      @apply bg-background text-dark font-sans antialiased;
      font-family: 'Inter', system-ui, sans-serif;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      @apply bg-transparent;
    }
    ::-webkit-scrollbar-thumb {
      @apply bg-gray-300 rounded;
    }
    ```
  - Create `packages/web/src/styles/theme.ts`:
    ```ts
    export const theme = {
      primary: '#A91B18',
      secondary: '#CEE7F3',
      dark: '#181717',
      background: '#F8FAED',
      text: '#1a1a1a',
      textMuted: '#787D6E',
      success: '#4C8258',
      warning: '#B48C3C',
      border: '#E5E7EB',
      diffAdded: '#dcfce7',
      diffRemoved: '#fee2e2',
    } as const;
    ```

  **Must NOT do**:
  - Do NOT add custom fonts via CDN — use system fallback
  - Do NOT add animation classes to Tailwind config (handled via Framer Motion)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS theme, design tokens, brand alignment
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — straightforward CSS+Tailwind

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9)
  - **Blocks**: Tasks 10-14 (all views depend on theme)
  - **Blocked By**: Task 1 (package must exist)

  **References**:
  - `packages/cli/src/theme.ts` — Existing brand colors to match
  - `packages/cli/src/components/startup.tsx` — See how colors are used in TUI

  **Acceptance Criteria**:
  - [ ] `packages/web/src/styles/index.css` has Tailwind directives
  - [ ] `packages/web/tailwind.config.ts` has brand colors
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Tailwind CSS compiles
    Tool: Bash
    Preconditions: packages/web exists
    Steps:
      1. cd packages/web && npx tailwindcss -i src/styles/index.css -o /dev/null
    Expected Result: Exit code 0, no errors
    Failure Indicators: Tailwind CLI not found, CSS parse errors
    Evidence: .omo/evidence/task-6-tailwind-build.txt
  ```

  **Commit**: YES (group with Task 7, 8, 9)
  - Message: `feat(web): add theme, hooks, layout, and components`
  - Files: `packages/web/src/styles/*`, `packages/web/src/components/*`, `packages/web/src/hooks/*`
  - Pre-commit: `cd packages/web && npx tsc --noEmit`

- [ ] 7. Web — Add API client and polling hooks

  **What to do**:
  - Create `packages/web/src/utils/api.ts`:
    ```ts
    const API_BASE = 'http://127.0.0.1:3928';

    export interface KlairEvent {
      id: number;
      timestamp: number;
      file: string;
      eventType: string;
      gitDiff: string | null;
    }

    export interface DaemonStatus {
      ok: boolean;
      running?: boolean;
      startedAt?: number;
      uptime?: number;
      watchRoot?: string;
      pid?: number | null;
      eventCount?: number;
    }

    export interface Settings {
      target: string | null;
      animate: boolean;
      streamOutput: boolean;
      verbose: boolean;
    }

    export async function fetchStatus(): Promise<DaemonStatus> {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) return { ok: false, running: false };
      return res.json();
    }

    export async function fetchEvents(limit = 50, offset = 0): Promise<KlairEvent[]> {
      const res = await fetch(`${API_BASE}/events?limit=${limit}&offset=${offset}`);
      if (!res.ok) return [];
      return res.json();
    }

    export async function fetchSettings(): Promise<Settings | null> {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) return null;
      return res.json();
    }

    export async function updateSettings(patch: Partial<Settings>): Promise<Settings | null> {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return null;
      return res.json();
    }

    export async function checkHealth(): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/health`);
        return res.ok;
      } catch {
        return false;
      }
    }
    ```
  - Create `packages/web/src/hooks/use-api.ts`:
    ```ts
    import { useState, useEffect, useCallback } from 'react';
    import { fetchStatus, fetchEvents, checkHealth } from '../utils/api';
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
    ```
  - Create `packages/web/src/hooks/use-events.ts` (re-export wrapper):
    ```ts
    export { useEvents, useDaemonStatus } from './use-api';
    ```

  **Must NOT do**:
  - Do NOT add error retry logic (MVP)
  - Do NOT add websocket or SSE (polling is fine)
  - Do NOT use axios or other HTTP libs — `fetch` is sufficient

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core data layer, multiple functions, type definitions
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — standard fetch + React hooks

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9)
  - **Blocks**: Tasks 10-14 (all views depend on data hooks)
  - **Blocked By**: Tasks 1, 2, 3, 4, 5 (scaffold + API endpoints)

  **References**:
  - `packages/cli/src/hooks/use-api.ts` — Existing polling pattern (2s interval)
  - `packages/cli/src/store/app-store.ts` — Existing event types (KlairEvent)

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` passes
  - [ ] `fetchStatus()` returns when daemon is running

  **QA Scenarios**:
  ```
  Scenario: API client compiles
    Tool: Bash
    Preconditions: packages/web exists
    Steps:
      1. cd packages/web && npx tsc --noEmit
    Expected Result: Exit code 0
    Evidence: .omo/evidence/task-7-tsc.txt
  ```

  **Commit**: YES (group with Task 6, 8, 9)

- [ ] 8. Web — Add layout shell (Header, Sidebar, Footer)

  **What to do**:
  - Create `packages/web/src/components/layout.tsx`:
    ```tsx
    import React from 'react';

    const NAV_ITEMS = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'events', label: 'Events' },
      { id: 'diff', label: 'Diffs' },
      { id: 'settings', label: 'Settings' },
    ] as const;

    interface LayoutProps {
      activeView: string;
      onNavigate: (view: string) => void;
      daemonRunning: boolean;
      children: React.ReactNode;
    }

    const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
      <span
        className={`inline-block w-2 h-2 rounded-full mr-2 ${
          active ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
    );

    export const Layout: React.FC<LayoutProps> = ({
      activeView,
      onNavigate,
      daemonRunning,
      children,
    }) => {
      return (
        <div className="flex flex-col h-screen bg-background text-dark">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-primary">KLAIR</h1>
              <StatusDot active={daemonRunning} />
              <span className="text-sm text-text-muted">
                {daemonRunning ? 'Active' : 'Idle'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>1-4 Navigate</span>
              <span>q Quit</span>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <nav className="w-48 border-r border-border bg-white py-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'text-primary font-semibold bg-red-50 border-r-2 border-primary'
                        : 'text-text-muted hover:text-dark hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between px-6 py-2 border-t border-border bg-white text-xs text-text-muted">
            <span>Ctrl+K commands · Click events to view diff · Polling every 2s</span>
            <span>KLAIR v0.2</span>
          </footer>
        </div>
      );
    };
    ```
  - Create `packages/web/src/components/status-indicator.tsx`:
    ```tsx
    import React from 'react';

    interface StatusIndicatorProps {
      running: boolean;
      label?: string;
    }

    export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
      running,
      label,
    }) => (
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            running ? 'bg-green-500 animate-pulse' : 'bg-red-400'
          }`}
        />
        <span className="text-sm text-text-muted">
          {label ?? (running ? 'Active' : 'Idle')}
        </span>
      </div>
    );
    ```

  **Must NOT do**:
  - Do NOT add React Router — using state-based view switching
  - Do NOT add icons — use text labels only (MVP)
  - Do NOT add responsive/mobile styles (terminal-first desktop app)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI layout, component design, brand styling
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — standard React+Tailwind layout

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9)
  - **Blocks**: Tasks 10-14 (all views render inside layout)
  - **Blocked By**: Task 1 (scaffold), Task 6 (theme)

  **References**:
  - `packages/cli/src/components/sidebar.tsx` — Existing sidebar nav items pattern
  - `packages/cli/src/components/header.tsx` — Existing header pattern (KLAIR + status)
  - `packages/cli/src/components/status-bar.tsx` — Existing footer shortcuts

  **Acceptance Criteria**:
  - [ ] Layout renders in browser with header, sidebar, content area, footer
  - [ ] Sidebar has 4 nav items (Dashboard, Events, Diffs, Settings)
  - [ ] Active nav item is highlighted in primary color
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Layout renders with all sections
    Tool: Playwright
    Preconditions: Vite dev server running on :3000, App.tsx uses Layout
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for page to load
      3. Check header contains "KLAIR"
      4. Check sidebar contains "Dashboard", "Events", "Diffs", "Settings"
      5. Check footer contains status text
    Expected Result: All layout sections visible
    Failure Indicators: Missing sections, layout broken
    Evidence: .omo/evidence/task-8-layout.png
  ```

  **Commit**: YES (group with Task 6, 7, 9)

- [ ] 9. Web — Add animation helpers + status indicator component

  **What to do**:
  - Create `packages/web/src/components/animations.tsx`:
    ```tsx
    import { motion, type Variants } from 'framer-motion';

    // Page transition: fade + slide up
    export const pageVariants: Variants = {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
      exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
    };

    // Stagger children reveal (for event lists)
    export const staggerContainer: Variants = {
      animate: {
        transition: { staggerChildren: 0.05 },
      },
    };

    export const staggerItem: Variants = {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    };

    // Button hover: scale + shadow
    export const buttonTap = { scale: 0.97 };
    export const buttonHover = { scale: 1.03 };

    // Loading spinner (rotate 360)
    export const spinTransition = {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    };

    export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
      <motion.div
        className="border-2 border-primary border-t-transparent rounded-full"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
    );

    // Animated page wrapper
    export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    );
    ```

  **Must NOT do**:
  - Do NOT add heavy animation libraries — Framer Motion is sufficient
  - Do NOT animate everything — only page transitions + list stagger + loading spinner

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Motion design, animation patterns
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — standard Framer Motion patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: Tasks 10-14 (views use AnimatedPage wrapper)
  - **Blocked By**: Task 1 (scaffold must have framer-motion dep)

  **References**:
  - Framer Motion docs: `https://www.framer.com/motion/introduction/`

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` passes
  - [ ] `AnimatedPage` wraps content with fade-in animation

  **QA Scenarios**:
  ```
  Scenario: Animation helpers compile
    Tool: Bash
    Preconditions: packages/web exists
    Steps:
      1. cd packages/web && npx tsc --noEmit
    Expected Result: Exit code 0, no type errors
    Evidence: .omo/evidence/task-9-tsc.txt
  ```

  **Commit**: YES (group with Task 6, 7, 8)
  - Message: `feat(web): add theme, hooks, layout, and components`
  - Files: all files from Tasks 6, 7, 8, 9
  - Pre-commit: `cd packages/web && npx tsc --noEmit`

- [ ] 10. Web — Add Dashboard page

  **What to do**:
  - Create `packages/web/src/pages/dashboard.tsx`:
    ```tsx
    import React from 'react';
    import { motion } from 'framer-motion';
    import { useDaemonStatus, useEvents } from '../hooks/use-api';
    import { AnimatedPage, LoadingSpinner, staggerContainer, staggerItem } from '../components/animations';
    import { StatusIndicator } from '../components/status-indicator';

    function formatTime(ts: number): string {
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      return `${Math.floor(mins / 60)}h ago`;
    }

    function shortPath(p: string, max = 40): string {
      if (!p) return '';
      const home = process.env.HOME || process.env.USERPROFILE || '';
      let path = home && p.startsWith(home) ? '~' + p.slice(home.length) : p;
      return path.length > max ? '…' + path.slice(-(max - 1)) : path;
    }

    function formatUptime(ms: number): string {
      const secs = Math.floor(ms / 1000);
      if (secs < 60) return `${secs}s`;
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m ${secs % 60}s`;
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m`;
    }

    export const Dashboard: React.FC = () => {
      const { running, status, loading } = useDaemonStatus();
      const { events } = useEvents(5);

      if (loading) {
        return (
          <AnimatedPage>
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          </AnimatedPage>
        );
      }

      return (
        <AnimatedPage>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

          {/* Status Card */}
          <div className="bg-white border border-border rounded p-5 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-4">
              Session Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Status </span>
                <StatusIndicator running={running} />
              </div>
              <div>
                <span className="text-text-muted">PID </span>
                <span className="text-dark font-mono">{status?.pid ?? '—'}</span>
              </div>
              <div>
                <span className="text-text-muted">Uptime </span>
                <span className="text-dark">
                  {status?.uptime ? formatUptime(status.uptime) : '—'}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Events </span>
                <span className="text-dark">{status?.eventCount ?? 0} captured</span>
              </div>
              <div className="col-span-2">
                <span className="text-text-muted">Target </span>
                <span className="text-dark font-mono text-xs">
                  {status?.watchRoot ? shortPath(status.watchRoot) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white border border-border rounded p-5 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-4">
              Recent Events
            </h3>
            {events.length === 0 ? (
              <p className="text-sm text-text-muted">
                No events yet. Start watching to capture changes.
              </p>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-2"
              >
                {events.map((evt) => (
                  <motion.div
                    key={evt.id}
                    variants={staggerItem}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted font-mono text-xs">#{evt.id}</span>
                      <span className="text-text-muted text-xs">{formatTime(evt.timestamp)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          evt.eventType === 'add'
                            ? 'bg-green-100 text-green-700'
                            : evt.eventType === 'unlink'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {evt.eventType}
                      </span>
                    </div>
                    <span className="text-dark font-mono text-xs truncate max-w-[300px]">
                      {shortPath(evt.file)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className={`px-5 py-2 rounded font-medium text-sm transition-all hover:scale-105 ${
                running
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={() => {/* TODO: wire start/stop */}}
            >
              {running ? 'Stop' : 'Start Watch'}
            </button>
            <button className="px-5 py-2 border border-border rounded text-sm text-text-muted hover:bg-gray-50 transition-all hover:scale-105">
              Reset
            </button>
          </div>
        </AnimatedPage>
      );
    };
    ```
  - The start/stop/reset buttons are display-only for MVP (actual daemon control from CLI)
  - Wire keyboard shortcuts: `1`=Dashboard, `2`=Events, `3`=Diff, `4`=Settings (in App.tsx later)

  **Must NOT do**:
  - Do NOT wire Start/Stop/Reset buttons to daemon API (daemon is CLI-controlled for now)
  - Do NOT add CPU usage (not available from daemon)
  - Do NOT add charts or graphs (future)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI layout, card design, status display
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: All — standard React+Tailwind page

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 14)
  - **Blocks**: Task 14 (App.tsx wiring needs page components)
  - **Blocked By**: Tasks 6, 7, 8, 9 (theme, hooks, layout, animations)

  **References**:
  - `packages/cli/src/components/dashboard.tsx` — Existing Dashboard TUI component (status card, recent events, buttons)

  **Acceptance Criteria**:
  - [ ] Dashboard renders with status card (status, PID, uptime, events count, target)
  - [ ] Recent events list shows last 5 events
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Dashboard renders status and events
    Tool: Playwright
    Preconditions: Vite dev server running, daemon running with events
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for dashboard to load (check for "Session Status" heading)
      3. Check "Recent Events" section is present
    Expected Result: Dashboard shows daemon status + recent events
    Failure Indicators: Page doesn't load, missing sections
    Evidence: .omo/evidence/task-10-dashboard.png
  ```

  **Commit**: YES (group with Tasks 11, 12, 13, 14)
  - Message: `feat(web): add all 4 page views and App.tsx wiring`
  - Files: `packages/web/src/pages/*.tsx`, `packages/web/src/App.tsx`
  - Pre-commit: `cd packages/web && npx tsc --noEmit`

- [ ] 11. Web — Add Events Timeline page + EventCard component

  **What to do**:
  - Create `packages/web/src/components/event-card.tsx`:
    ```tsx
    import React from 'react';
    import { motion } from 'framer-motion';
    import type { KlairEvent } from '../utils/api';
    import { staggerItem } from './animations';

    interface EventCardProps {
      event: KlairEvent;
      isSelected: boolean;
      onClick: () => void;
    }

    function formatTime(ts: number): string {
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      return `${Math.floor(mins / 60)}h ago`;
    }

    function shortPath(p: string, max = 35): string {
      if (!p) return '';
      const home = process.env.HOME || process.env.USERPROFILE || '';
      let path = home && p.startsWith(home) ? '~' + p.slice(home.length) : p;
      return path.length > max ? '…' + path.slice(-(max - 1)) : path;
    }

    const typeColors: Record<string, string> = {
      add: 'bg-green-100 text-green-700',
      change: 'bg-blue-100 text-blue-700',
      unlink: 'bg-red-100 text-red-700',
    };

    export const EventCard: React.FC<EventCardProps> = ({ event, isSelected, onClick }) => (
      <motion.div
        variants={staggerItem}
        onClick={onClick}
        className={`flex items-center justify-between py-2 px-4 rounded cursor-pointer text-sm transition-colors ${
          isSelected
            ? 'bg-red-50 border border-red-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-text-muted font-mono text-xs shrink-0">#{event.id}</span>
          <span className="text-text-muted text-xs shrink-0">{formatTime(event.timestamp)}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${
              typeColors[event.eventType] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {event.eventType}
          </span>
        </div>
        <span className="text-dark font-mono text-xs truncate ml-4 max-w-[400px]">
          {shortPath(event.file)}
        </span>
      </motion.div>
    );
    ```
  - Create `packages/web/src/pages/events.tsx`:
    ```tsx
    import React, { useState } from 'react';
    import { AnimatedPage } from '../components/animations';
    import { useEvents } from '../hooks/use-api';
    import { EventCard } from '../components/event-card';
    import { LoadingSpinner } from '../components/animations';

    interface EventsProps {
      onSelectEvent: (eventId: number) => void;
    }

    export const Events: React.FC<EventsProps> = ({ onSelectEvent }) => {
      const [selectedId, setSelectedId] = useState<number | null>(null);
      const { events, loading } = useEvents(100);
      const [page, setPage] = useState(0);
      const PAGE_SIZE = 20;
      const paginatedEvents = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      const totalPages = Math.ceil(events.length / PAGE_SIZE);

      const handleClick = (id: number) => {
        setSelectedId(id);
        onSelectEvent(id);
      };

      if (loading) {
        return (
          <AnimatedPage>
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          </AnimatedPage>
        );
      }

      return (
        <AnimatedPage>
          <h2 className="text-2xl font-bold mb-6">Event Timeline</h2>

          {/* Events List */}
          <div className="bg-white border border-border rounded p-4 mb-4">
            {paginatedEvents.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">
                No events captured yet.
              </p>
            ) : (
              <div className="space-y-1">
                {paginatedEvents.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    isSelected={selectedId === evt.id}
                    onClick={() => handleClick(evt.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </AnimatedPage>
      );
    };
    ```

  **Must NOT do**:
  - Do NOT add search/filter (future)
  - Do NOT add infinite scroll (simple pagination is fine)
  - Do NOT fetch diff separately (gitDiff is in event data)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: List rendering, click interaction, card design
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12, 13, 14)
  - **Blocks**: Task 14 (App.tsx wiring)
  - **Blocked By**: Tasks 6, 7, 8, 9

  **References**:
  - `packages/cli/src/components/events.tsx` — Existing events TUI component pattern
  - `packages/cli/src/utils/api.ts` — Event type definition

  **Acceptance Criteria**:
  - [ ] Events page shows list of events with id, timestamp, file path, event type
  - [ ] Clicking an event selects it (highlighted) and calls onSelectEvent
  - [ ] Pagination controls work (Previous/Next)
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Events timeline renders with pagination
    Tool: Playwright
    Preconditions: Vite dev server running, daemon has events
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "Events" in sidebar (or navigate to events view)
      3. Wait for events list to render
    Expected Result: Events visible with file paths, timestamps, type badges
    Failure Indicators: No events shown, pagination broken
    Evidence: .omo/evidence/task-11-events.png
  ```

  **Commit**: YES (group with Tasks 10, 12, 13, 14)

- [ ] 12. Web — Add Diff Viewer page + DiffPanel component

  **What to do**:
  - Create `packages/web/src/components/diff-panel.tsx`:
    ```tsx
    import React, { useState } from 'react';
    import { AnimatePresence, motion } from 'framer-motion';

    interface DiffPanelProps {
      gitDiff: string | null;
      fileName: string;
    }

    function parseDiffLines(diff: string): { type: 'add' | 'remove' | 'same'; text: string }[] {
      return diff.split('\n').map((line) => {
        if (line.startsWith('+')) return { type: 'add', text: line };
        if (line.startsWith('-')) return { type: 'remove', text: line };
        return { type: 'same', text: line };
      });
    }

    export const DiffPanel: React.FC<DiffPanelProps> = ({ gitDiff, fileName }) => {
      const [showUnchanged, setShowUnchanged] = useState(true);

      if (!gitDiff) {
        return (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm">
            No diff available for this event.
          </div>
        );
      }

      const lines = parseDiffLines(gitDiff);
      const visibleLines = showUnchanged ? lines : lines.filter((l) => l.type !== 'same');

      const copyContent = gitDiff;

      return (
        <div className="bg-white border border-border rounded overflow-hidden">
          {/* Diff Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-border">
            <span className="text-sm font-mono text-dark truncate">{fileName}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnchanged}
                  onChange={() => setShowUnchanged(!showUnchanged)}
                  className="rounded"
                />
                Show unchanged
              </label>
              <button
                onClick={() => navigator.clipboard.writeText(copyContent)}
                className="text-xs px-2 py-1 border border-border rounded hover:bg-gray-100"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Diff Content */}
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <pre className="text-xs font-mono leading-5 p-0 m-0">
              <code>
                <AnimatePresence>
                  {visibleLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`px-4 ${
                        line.type === 'add'
                          ? 'bg-green-50 text-green-800'
                          : line.type === 'remove'
                            ? 'bg-red-50 text-red-800'
                            : 'text-gray-600'
                      }`}
                    >
                      <span className="select-none text-gray-400 mr-4 inline-block w-8 text-right">
                        {i + 1}
                      </span>
                      {line.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </code>
            </pre>
          </div>
        </div>
      );
    };
    ```
  - Create `packages/web/src/pages/diff-viewer.tsx`:
    ```tsx
    import React from 'react';
    import { AnimatedPage } from '../components/animations';
    import { DiffPanel } from '../components/diff-panel';
    import { useEvents } from '../hooks/use-api';

    interface DiffViewerProps {
      selectedEventId: number | null;
      onBack: () => void;
    }

    export const DiffViewer: React.FC<DiffViewerProps> = ({ selectedEventId, onBack }) => {
      const { events } = useEvents(100);
      const selectedEvent = events.find((e) => e.id === selectedEventId);

      return (
        <AnimatedPage>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="text-sm text-primary hover:underline"
            >
              ← Back to Events
            </button>
            <h2 className="text-2xl font-bold">Diff Viewer</h2>
          </div>

          {!selectedEvent ? (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
              Select an event from the Events timeline to view its diff.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <span>
                  Event <span className="font-mono text-dark">#{selectedEvent.id}</span>
                </span>
                <span>·</span>
                <span className="font-mono text-dark">{selectedEvent.eventType}</span>
                <span>·</span>
                <span className="font-mono text-dark">{selectedEvent.file}</span>
              </div>
              <DiffPanel
                gitDiff={selectedEvent.gitDiff}
                fileName={selectedEvent.file}
              />
            </div>
          )}
        </AnimatedPage>
      );
    };
    ```

  **Must NOT do**:
  - Do NOT add syntax highlighting library (MVP — plain diff is sufficient)
  - Do NOT add side-by-side columns (MVP — unified diff with color coding)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Code display, diff rendering, interactive elements
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 13, 14)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 6, 7, 8, 9

  **References**:
  - `packages/cli/src/components/diff-viewer.tsx` — Existing TUI diff viewer pattern

  **Acceptance Criteria**:
  - [ ] Diff viewer shows "Select an event" message when no event selected
  - [ ] When event selected, shows diff with line numbers
  - [ ] Green for additions, red for deletions
  - [ ] "Show unchanged" toggle works
  - [ ] Copy button copies diff to clipboard
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Diff viewer renders selected event's diff
    Tool: Playwright
    Preconditions: Vite dev server running, daemon has events with git diffs
    Steps:
      1. Navigate to events view
      2. Click an event
      3. Verify diff viewer shows colored diff lines with line numbers
    Expected Result: Diff visible with green additions, red deletions
    Failure Indicators: No diff, wrong colors, no line numbers
    Evidence: .omo/evidence/task-12-diff-viewer.png

  Scenario: No event selected state
    Tool: Playwright
    Preconditions: Vite running
    Steps:
      1. Navigate directly to diff view
    Expected Result: "Select an event from the Events timeline" message
    Evidence: .omo/evidence/task-12-empty-state.png
  ```

  **Commit**: YES (group with Tasks 10, 11, 13, 14)

- [ ] 13. Web — Add Settings page

  **What to do**:
  - Create `packages/web/src/pages/settings.tsx`:
    ```tsx
    import React, { useState, useEffect } from 'react';
    import { AnimatedPage, LoadingSpinner } from '../components/animations';
    import { fetchSettings, updateSettings } from '../utils/api';
    import type { Settings as SettingsType } from '../utils/api';

    export const Settings: React.FC = () => {
      const [settings, setSettings] = useState<SettingsType | null>(null);
      const [loading, setLoading] = useState(true);
      const [saving, setSaving] = useState(false);
      const [saved, setSaved] = useState(false);

      useEffect(() => {
        fetchSettings().then((s) => {
          setSettings(s);
          setLoading(false);
        });
      }, []);

      const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        const result = await updateSettings(settings);
        if (result) setSettings(result);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };

      if (loading) {
        return (
          <AnimatedPage>
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          </AnimatedPage>
        );
      }

      return (
        <AnimatedPage>
          <h2 className="text-2xl font-bold mb-6">Settings</h2>

          <div className="bg-white border border-border rounded p-6 max-w-lg">
            <div className="space-y-5">
              {/* Target Directory */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Target Directory
                </label>
                <input
                  type="text"
                  value={settings?.target ?? ''}
                  onChange={(e) =>
                    setSettings((s) => (s ? { ...s, target: e.target.value } : s))
                  }
                  className="w-full px-3 py-2 border border-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="/path/to/watch"
                />
              </div>

              {/* Animate Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-dark">
                    Animated Output
                  </label>
                  <p className="text-xs text-text-muted">
                    Show animated startup sequence
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.animate ?? false}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, animate: e.target.checked } : s
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Stream Output Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-dark">
                    Stream Output
                  </label>
                  <p className="text-xs text-text-muted">
                    Stream file events in real-time
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.streamOutput ?? false}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, streamOutput: e.target.checked } : s
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Verbose Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-dark">
                    Verbose Logging
                  </label>
                  <p className="text-xs text-text-muted">
                    Log detailed file change information
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.verbose ?? false}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, verbose: e.target.checked } : s
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-primary text-white rounded font-medium text-sm hover:bg-primary-hover transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                {saved && (
                  <span className="ml-3 text-sm text-green-600">
                    ✓ Saved to ~/.klair/settings.json
                  </span>
                )}
              </div>
            </div>
          </div>
        </AnimatedPage>
      );
    };
    ```

  **Must NOT do**:
  - Do NOT add file browser for target directory (text input only)
  - Do NOT add validation for target directory path

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Form handling, API read/write, toggle controls
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12, 14)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 6, 7, 8, 9

  **References**:
  - `packages/daemon/src/settings.js:7-11` — Settings defaults and shape
  - `packages/cli/src/components/settings.tsx` — Existing TUI settings pattern

  **Acceptance Criteria**:
  - [ ] Settings page loads with current values from daemon API
  - [ ] Toggle switches update local state
  - [ ] Save button writes to daemon API and shows confirmation
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Settings page loads and saves
    Tool: Playwright
    Preconditions: Vite dev server running, daemon running
    Steps:
      1. Navigate to settings view
      2. Wait for settings to load (check for "Target Directory" input)
      3. Toggle "Verbose Logging" on
      4. Click "Save Settings"
      5. Check for "Saved" confirmation message
      6. Refresh page and verify verbose is still on
    Expected Result: Settings persist across page loads
    Failure Indicators: Settings don't load, save doesn't work
    Evidence: .omo/evidence/task-13-settings.png
  ```

  **Commit**: YES (group with Tasks 10, 11, 12, 14)

- [ ] 14. Web — Wire App.tsx with view routing and keyboard shortcuts

  **What to do**:
  - Create `packages/web/src/App.tsx`:
    ```tsx
    import React, { useState, useEffect, useCallback } from 'react';
    import { Layout } from './components/layout';
    import { Dashboard } from './pages/dashboard';
    import { Events } from './pages/events';
    import { DiffViewer } from './pages/diff-viewer';
    import { Settings } from './pages/settings';
    import { useDaemonStatus } from './hooks/use-api';

    type View = 'dashboard' | 'events' | 'diff' | 'settings';

    function App() {
      const [activeView, setActiveView] = useState<View>('dashboard');
      const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
      const { running, loading } = useDaemonStatus();

      const handleNavigate = useCallback((view: string) => {
        setActiveView(view as View);
      }, []);

      const handleSelectEvent = useCallback((eventId: number) => {
        setSelectedEventId(eventId);
        setActiveView('diff');
      }, []);

      const handleBackFromDiff = useCallback(() => {
        setActiveView('events');
      }, []);

      // Keyboard shortcuts
      useEffect(() => {
        const handler = (e: KeyboardEvent) => {
          if (e.key === '1') setActiveView('dashboard');
          else if (e.key === '2') setActiveView('events');
          else if (e.key === '3') setActiveView('diff');
          else if (e.key === '4') setActiveView('settings');
          else if (e.key === 'q') window.close();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
      }, []);

      const renderView = () => {
        switch (activeView) {
          case 'dashboard':
            return <Dashboard />;
          case 'events':
            return <Events onSelectEvent={handleSelectEvent} />;
          case 'diff':
            return (
              <DiffViewer
                selectedEventId={selectedEventId}
                onBack={handleBackFromDiff}
              />
            );
          case 'settings':
            return <Settings />;
          default:
            return <Dashboard />;
        }
      };

      return (
        <Layout
          activeView={activeView}
          onNavigate={handleNavigate}
          daemonRunning={running}
        >
          {renderView()}
        </Layout>
      );
    }

    export default App;
    ```
  - Update `packages/web/src/main.tsx` to import and render App:
    ```tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './styles/index.css';

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```

  **Must NOT do**:
  - Do NOT add React Router — state-based view switching is sufficient
  - Do NOT add error boundaries (MVP)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Root component wiring, view routing logic, event flow orchestration
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (if pages don't exist yet, use placeholder imports)
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12, 13)
  - **Blocks**: F1-F4 (final verification requires complete app)
  - **Blocked By**: Tasks 8 (Layout), 10, 11, 12, 13 (all pages)

  **References**:
  - `packages/cli/src/app.tsx` — Existing TUI App.tsx routing pattern (state-based view switching, keyboard shortcuts 1-4)
  - `packages/cli/src/index.tsx` — Existing entry point pattern

  **Acceptance Criteria**:
  - [ ] Browser loads app with Dashboard as default view
  - [ ] Clicking sidebar items switches views
  - [ ] Keyboard `1-4` switches views
  - [ ] Clicking event in Events → navigates to Diff view
  - [ ] Back button in Diff view → returns to Events
  - [ ] `npx tsc --noEmit` passes
  - [ ] Vite dev server starts without errors

  **QA Scenarios**:
  ```
  Scenario: Full navigation flow
    Tool: Playwright
    Preconditions: Vite dev server running
    Steps:
      1. Load http://localhost:3000 — verify Dashboard shows
      2. Click "Events" in sidebar — verify Events view
      3. Press key "3" — verify Diff view (with empty state)
      4. Press key "4" — verify Settings view
      5. Press key "1" — verify Dashboard view
    Expected Result: All 4 views render and are navigable via clicks and keyboard
    Failure Indicators: View doesn't change, wrong content shown
    Evidence: .omo/evidence/task-14-navigation.gif

  Scenario: Event click → diff navigation
    Tool: Playwright
    Preconditions: Daemon running with events
    Steps:
      1. Navigate to Events view
      2. Click on an event
    Expected Result: View switches to Diff with selected event's diff
    Evidence: .omo/evidence/task-14-event-to-diff.png
  ```

  **Commit**: YES (group with Tasks 10, 11, 12, 13)
  - Message: `feat(web): add all 4 page views and App.tsx wiring`
  - Files: all page + component + App files
  - Pre-commit: `cd packages/web && npx tsc --noEmit`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have" verify implementation exists (curl endpoints, check HTML renders). For each "Must NOT Have" search codebase for forbidden patterns. Check evidence files exist in `.omo/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **TypeScript + Build Verification** — `unspecified-high`
  Run `tsc --noEmit` in packages/web. Check `npm run dev` starts Vite without errors. Verify Tailwind classes are properly compiled.
  Output: `TypeScript [PASS/FAIL] | Dev server [PASS/FAIL] | CSS [PASS/FAIL] | VERDICT`

- [ ] F3. **Manual QA (Playwright)** — `unspecified-high` (+ playwright skill)
  Start from clean state. Start Vite dev server and daemon. Execute EVERY QA scenario from EVERY task — follow exact steps, capture screenshots. Test cross-view integration. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond was built. Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Task | Message | Files | Pre-commit |
|------|---------|-------|------------|
| 1 | `feat(web): scaffold Vite + React + Tailwind project` | packages/web/* | — |
| 2 | `feat(daemon): add CORS middleware` | daemon/src/api.js | `node --check` |
| 3 | `feat(daemon): add GET /status endpoint` | daemon/src/api.js, daemon/src/database.js | `node --check` |
| 4 | `feat(daemon): add GET/PUT /settings endpoints` | daemon/src/api.js, daemon/src/database.js | `node --check` |
| 5 | `feat(daemon): add offset pagination to /events` | daemon/src/api.js, daemon/src/database.js | `node --check` |
| 6 | `feat(web): add Tailwind theme with brand colors` | web/src/styles/* | `tsc --noEmit` |
| 7 | `feat(web): add API client and polling hooks` | web/src/utils/api.ts, web/src/hooks/* | `tsc --noEmit` |
| 8 | `feat(web): add layout shell (header, sidebar, footer)` | web/src/components/layout.tsx, web/src/App.tsx | `tsc --noEmit` |
| 9 | `feat(web): add status indicator and animation helpers` | web/src/components/* | `tsc --noEmit` |
| 10 | `feat(web): add dashboard page` | web/src/pages/dashboard.tsx | `tsc --noEmit` |
| 11 | `feat(web): add events timeline page` | web/src/pages/events.tsx, web/src/components/event-card.tsx | `tsc --noEmit` |
| 12 | `feat(web): add diff viewer page` | web/src/pages/diff-viewer.tsx, web/src/components/diff-panel.tsx | `tsc --noEmit` |
| 13 | `feat(web): add settings page` | web/src/pages/settings.tsx | `tsc --noEmit` |
| 14 | `feat(web): wire App.tsx with view routing` | web/src/App.tsx | `tsc --noEmit` |

---

## Success Criteria

### Verification Commands
```bash
# Daemon syntax check
node --check packages/daemon/src/api.js

# Web TypeScript check
cd packages/web && npx tsc --noEmit

# Vite dev server starts
cd packages/web && npx vite --port 3000 &
curl -s http://localhost:3000 | head -5

# Daemon API works
curl -s http://localhost:3928/health
curl -s http://localhost:3928/status
curl -s http://localhost:3928/settings
curl -s -X PUT -H 'Content-Type: application/json' -d '{"verbose":true}' http://localhost:3928/settings
curl -s 'http://localhost:3928/events?limit=5&offset=0'
```

### Final Checklist
- [ ] All "Must Have" implemented and verified via QA scenarios
- [ ] All "Must NOT Have" absent from codebase
- [ ] Vite dev server starts on :3000
- [ ] Daemon API responds to all 5 endpoints
- [ ] CORS headers present on all daemon responses
- [ ] Brand colors visible in browser
- [ ] All 4 views render and are navigable
- [ ] Events poll every 2s
- [ ] Settings save via daemon API
