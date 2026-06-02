# KLAIR

The tool that tells you what your AI agent actually did.

## Quick Start

```bash
npm install -g klair-watch
klair watch ~/your-project
```

## The Problem

When you let Claude Code, Cursor, or any agent loose on your codebase, it does impressive work in isolation. Then you merge it back and things quietly break. You spend hours debugging what you can't see.

## The Solution

KLAIR watches everything.

That's it. Now you see every file change your agent made, with before/after diffs and real-time timeline.

## Why KLAIR?

AI coding tools are powerful. But they generate bloat.

Wrapper classes. Configuration systems. Abstractions for things that don't need them.

You don't see it until 70% of your codebase is over-engineered mess.

KLAIR watches what your agent actually does. See every change. Understand every decision. Catch complexity before it compounds.

Maintain ownership of your code.

## Features

- **Timeline** — Real-time view of every file change
- **Diff Viewer** — Before/after code comparison
- **Dashboard** — Session stats, file counts, event metrics
- **Settings** — Debounce, ignore patterns, theme
- **Keyboard + Mouse** — Full navigation support
- **Independent** — Works with any agent (Cursor, Claude Code, custom, etc)
- **Honest** — No vendor spin, just the facts
- **Local-first** — Everything runs locally, no cloud
- **Open source** — See exactly how it works

## Navigation

- **1-4** — Switch tabs (Dashboard, Timeline, Diff, Settings)
- **↑↓** — Navigate within page
- **Enter** — Select/activate
- **Esc** — Back

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

---

Built with Node.js, React, OpenTUI, and honest observation.
