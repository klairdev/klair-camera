# KLAIR

The tool that tells you what your AI agent actually did.

## The Problem

When you let Claude Code, Cursor, or any agent loose on your codebase, it does impressive work in isolation. Then you merge it back and things quietly break. You spend hours debugging what you can't see.

## The Solution

KLAIR watches everything.

```bash
npm install -g klair-watch
klair watch ~/your-project
```

That's it. Now you see every file change your agent made, with before/after diffs and real-time timeline.

## Features

- **Timeline** — Real-time view of every file change
- **Diff Viewer** — Before/after code comparison
- **Dashboard** — Session stats, file counts, event metrics
- **Settings** — Debounce, ignore patterns, theme
- **Keyboard + Mouse** — Full navigation support

## Why KLAIR?

- **Independent** — Works with any agent (Cursor, Claude Code, custom, etc)
- **Honest** — No vendor spin, just the facts
- **Local-first** — Everything runs locally, no cloud
- **Open source** — See exactly how it works

## Quick Start

```bash
# Install
npm install -g klair-watch

# Watch a project
klair watch ~/my-project

# Navigate
1-4: Switch tabs (Dashboard, Timeline, Diff, Settings)
↑↓: Navigate within page
Enter: Select/activate
Esc: Back
/: Open command palette
```

## Navigation

- **Dashboard** — Session overview, stats, actions
- **Timeline** — All file changes in real-time
- **Diff Viewer** — See what changed in code
- **Settings** — Configure behavior

## Commands

- `/start` — Start watching
- `/stop` — Stop watching
- `/reset` — Clear events
- `/help` — Show help
- `/quit` — Exit

## Status

**v0.4** — MVP shipped May 30, 2026

- ✓ Unified daemon + CLI
- ✓ Real file watching
- ✓ Timeline with live events
- ✓ Diff viewer
- ✓ Settings management
- ✓ Open source

## Next (v0.5+)

- Web dashboard (React)
- AI-powered analysis ("Hey KLAIR, what broke?")
- VS Code extension
- Team mode

## License

MIT

---

Built with Node.js, React, OpenTUI, and honest observation.
