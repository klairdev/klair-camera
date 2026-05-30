# Draft: KLAIR Web GUI

## Current Architecture
- Monorepo: `packages/cli` (Bun/OpenTUI TUI + Node.js CLI wrapper) + `packages/daemon` (Express on :3928)
- Daemon API: only 2 endpoints (`GET /health`, `GET /events?limit=N`)
- No CORS headers, no static file serving
- TUI uses OpenTUI (terminal React), not DOM React

## Requirements (from user spec)
- React 19 + TypeScript + Tailwind CSS + Framer Motion
- Served on localhost:3000 (dev) / daemon (prod)
- Polls daemon API every 2s
- 4 views: Dashboard, Events, Diff, Settings
- Brand colors: Tuscan Red, Pale Cerulean, Noir, Satin Linen

## Decisions (confirmed)
- New package: `packages/web` (Vite + React 19 + TS + Tailwind v3 + Framer Motion)
- API expansion: Add CORS + status/settings/pagination endpoints to daemon
- Tests: No tests for MVP

## Daemon API Changes Needed
1. CORS headers (manual middleware, no cors dep)
2. GET /status — uptime, event count, watch root, PID
3. GET /settings — read from ~/.klair/settings.json
4. PUT /settings — write to ~/.klair/settings.json
5. GET /events?offset=N — pagination support
6. Max limit 100 → 1000

## Web Package Structure
packages/web/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── postcss.config.js
├── tailwind.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   ├── index.css
    │   └── theme.ts
    ├── utils/
    │   └── api.ts
    ├── hooks/
    │   ├── use-events.ts
    │   └── use-api.ts
    ├── components/
    │   ├── layout.tsx
    │   ├── status-indicator.tsx
    │   ├── event-card.tsx
    │   ├── diff-panel.tsx
    │   └── animations.tsx
    └── pages/
        ├── dashboard.tsx
        ├── events.tsx
        ├── diff-viewer.tsx
        └── settings.tsx
