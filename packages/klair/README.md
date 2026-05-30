# KLAIR

**Observing the Agent Era**

KLAIR is the observability layer for the agentic era. Watch AI agents write code in real-time through a premium terminal interface.

## Installation

```bash
npm install -g klair
```

Or from source:

```bash
git clone <repo>
cd klair-camera
npm install
npm run build -w packages/klair
```

## Usage

```bash
# Start watching a project
klair run ~/my-project

# Start daemon only (API at http://localhost:4200)
klair daemon ~/my-project
```

## Requirements

- Node.js >= 22.5
- Bun (for the TUI interface)

## Architecture

- **Daemon**: Background process that watches file changes, captures git diffs, and serves a REST API
- **CLI/TUI**: Terminal UI built with OpenTUI + React 19
- **Database**: SQLite stored at `~/.klair/klair.db`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/status | Daemon status |
| GET /api/sessions | List all sessions |
| GET /api/sessions/active | Get active session |
| POST /api/sessions | Create new session |
| GET /api/sessions/:id/events | Get events for session |
| GET /api/sessions/:id/stats | Get session stats |
| GET /api/events/:eventId/diff | Get diff for event |
| GET /api/settings | Get settings |
| PUT /api/settings | Update settings |
| GET /api/dashboard | Get dashboard stats |

## Development

```bash
# Build
npm run build -w packages/klair

# Run TUI in dev mode (with Bun)
cd packages/klair && bun run dev

# Start daemon
node packages/klair/dist/daemon/index.js
```

## License

Proprietary — KLAIR Engineering
