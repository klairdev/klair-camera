# KLAIR Complete Rebuild — Unified, Exclusive, World-Class

## TL;DR

> **Objective**: Complete rebuild of `klair watch` CLI/TUI into a single unified command with ANSI pixel-art KLAIR logo, premium feel, and exclusive experience worthy of $50/month — inspired by Claude Code, Hermes, Qwen CLI, and Codex CLI.
>
> **Deliverables**:
> - ANSI pixel-art KLAIR frame-mark logo rendered on startup + dashboard
> - Daemon lifecycle fully embedded (no separate process management needed)
> - Complete TUI redesign: dashboard, timeline, diff viewer, settings
> - Premium interactions: smooth animations, strategic colors, exclusive feel
>
> **Estimated Effort**: Large (10+ files, ~800 lines changed)
> **Parallel Execution**: YES — waves of 3-5 tasks
> **Critical Path**: Logo renderer → Startup → Dashboard → All pages → Polish

---

## Context

### Current State
- **Daemon + CLI merged**: Daemon source copied into `cli/src/lib/daemon/`, spawned as child process on `klair watch`
- **TUI built**: OpenTUI React terminal UI with dashboard, timeline, diff, settings, command palette, focus system
- **Logo**: Block-style ASCII art in `src/utils/logo.ts`
- **`klair watch [dir]` entry**: `bin/klair.js` → spawns daemon → launches TUI via Bun

### User's Request
1. Replace ASCII logo with ANSI pixel-art version from `klair 8bit term NEW.png`
2. Rebuild the TUI completely — every page, every interaction
3. Make it feel exclusive, premium, and addictive — like Claude Code, Hermes, Qwen CLI, Codex CLI
4. Daemon remains embedded (already done)
5. `klair watch` → startup animation → TUI (seamless)

### ANSI Pixel Art Logo
The user provided a grid of terminal background color codes forming a KLAIR frame-mark logo. The pattern uses:
- Dark gray (`48;5;234`) — background canvas
- Tuscan Red shades (`48;5;124`, `48;5;52`, `48;5;88`, `48;5;1`) — frame border, center dot, highlights
- Light accents (`48;5;15`, `48;5;255`, `48;5;254`) — subtle highlights near the dot

---

## Work Objectives

### Core Objective
Replace the ASCII block logo with an ANSI pixel-art KLAIR frame-mark logo, then rebuild every page of the TUI for premium, exclusive feel.

### Concrete Deliverables
1. `src/utils/logo-pixel.ts` — NEW: ANSI pixel art logo renderer
2. `src/components/startup.tsx` — Rebuilt with pixel art logo + smooth animation
3. `src/components/dashboard.tsx` — Complete redesign with pixel art hero + refined cards
4. `src/components/header.tsx` — Premium header with pixel art brand mark
5. `src/components/events.tsx` — Refined timeline
6. `src/components/diff-viewer.tsx` — Refined split-view diff
7. `src/components/settings.tsx` — Refined settings form
8. `src/components/status-bar.tsx` — Premium footer
9. `src/components/command-palette.tsx` — Polished command palette
10. `src/theme.ts` — Refined color palette

---

## TODOs

- [ ] 1. Create ANSI pixel art logo renderer

  **What to do**:
  - Create `src/utils/logo-pixel.ts`
  - Define a 2D array of terminal color codes matching the pixel art from the user's ANSI sequence
  - Export functions: `renderPixelLogo()` → returns array of colored text rows
  - Each cell = a background color (`48;5;XXX`) + a space character → creates a pixel block
  - Key colors to map:
    - `234` → dark gray background (invisible on dark bg)
    - `124` / `52` / `88` / `1` → Tuscan Red shades (the frame + dot)
    - `15` / `255` / `254` → light accents (subtle highlights)
  - The logo is approximately 80 columns wide × 16 rows tall

  **Must NOT do**:
  - Don't use the full-width block ASCII art (too wide for most terminals)
  - Don't hardcode ANSI escapes in components — use the renderer

  **References**:
  - User's ANSI color code sequence in the request
  - Existing `src/utils/logo.ts` — pattern to follow for export

  **Acceptance Criteria**:
  - [ ] `renderPixelLogo()` returns correctly colored pixel art
  - [ ] Logo is ~40-80 cols wide, fits standard terminals
  - [ ] Red frame + center dot clearly visible on dark background
  - [ ] Works with OpenTUI text color system

- [ ] 2. Rebuild startup sequence

  **What to do**:
  - Replace `KLAIR_LOGO` import with `renderPixelLogo()` from `logo-pixel.ts`
  - Replace ASCII text logo rows with pixel art rows
  - Each row: concatenate colored `text` elements with `fg` or custom styling
  - Keep the spinner animation (6-frame)
  - Keep the status messages (daemon started, watching, ready)
  - Add "Observing the Agent Era" tagline below the logo (cerulean, subtle)
  - Reduce startup time to ~2.5s for snappier feel
  - Add subtle fade-in feel to status messages

  **Must NOT do**:
  - Don't add the full block ASCII art alongside pixel art — replace entirely
  - Don't change the overall startup structure

  **References**:
  - `src/components/startup.tsx` — current startup
  - `src/utils/logo-pixel.ts` — new renderer
  - `src/components/spinner.tsx` — current spinner

  **Acceptance Criteria**:
  - [ ] Pixel art KLAIR logo appears on startup
  - [ ] "Observing the Agent Era" tagline shows below
  - [ ] Spinner and status messages animate smoothly
  - [ ] Startup completes in ~2.5s

- [ ] 3. Rebuild dashboard with pixel art hero

  **What to do**:
  - Hero area: pixel art logo centered at top (similar to startup but smaller)
  - Below logo: pulsing status dot + "watching [path]" + PID
  - Three cards (session, health, recent activity) — refined for premium feel:
    - Borders: slightly more visible
    - Title bars: consistent uppercase styling
    - Labels: matching the new design language (12px muted gray)
    - Values: 14px bright text
  - Quick actions card with keyboard hints (S, R, C, W)
  - Event type badges: colored background blocks for create/modify/delete
  - Responsive: compact mode for small terminals, spacious for large

  **Must NOT do**:
  - Don't change the data model or API calls
  - Don't add new hooks

  **References**:
  - `src/components/dashboard.tsx` — current dashboard
  - `src/components/card.tsx` — current card component
  - `src/theme.ts` — color constants

  **Acceptance Criteria**:
  - [ ] Pixel art logo centered on dashboard
  - [ ] Status dot pulses green when active
  - [ ] "Watching ~/path · pid 12345" clearly visible
  - [ ] Three cards with premium spacing
  - [ ] Event type badges color-coded
  - [ ] Responsive layout works (compact/spacious)

- [ ] 4. Rebuild header with brand mark

  **What to do**:
  - Replace full-width ASCII logo in the hero area with a smaller pixel art version
  - Brand bar: `KLAIR / watch` with Tuscan Red accent
  - Tab navigation: premium spacing, active tab highlighted with red background
  - Compact mode: abbreviated tabs for narrow terminals
  - Right side: PID + status dot + active/idle text

  **Must NOT do**:
  - Don't change the tab navigation structure
  - Don't add new state management

  **References**:
  - `src/components/header.tsx` — current header

  **Acceptance Criteria**:
  - [ ] Brand bar shows `KLAIR / watch` + PID + status dot
  - [ ] Tabs clickable, active tab highlighted
  - [ ] Responsive compact mode works

- [ ] 5. Refine timeline (events) page

  **What to do**:
  - Search bar: clean labels ("search" / "type" without colons)
  - Event rows: better visual hierarchy
    - Focused row: red border ring + `▶` pointer + dark bg
    - Event type: color badge with background
    - Timestamp: muted gray
    - File path: bright text, truncated gracefully
  - Pagination: centered, clean "prev / next" buttons
  - Empty state: friendly message

  **Must NOT do**:
  - Don't change filtering/pagination logic

  **References**:
  - `src/components/events.tsx` — current events page

  **Acceptance Criteria**:
  - [ ] Focused events show visible red border
  - [ ] Event types color-coded as badges
  - [ ] Search/filter works with clean labels
  - [ ] Pagination buttons functional

- [ ] 6. Refine diff viewer

  **What to do**:
  - Header card: file name + +/- stats + timestamp
  - Split view: before (red tint) / after (green tint) with scrollable columns
  - Line numbers: padded, right-aligned, gray
  - Added lines: green text on green bg
  - Removed lines: red text on red bg
  - Hunk headers: cerulean on dark bg
  - Back button: focusable, clickable
  - Responsive: stacked mode for narrow terminals

  **Must NOT do**:
  - Don't change the diff parsing logic

  **References**:
  - `src/components/diff-viewer.tsx` — current diff viewer

  **Acceptance Criteria**:
  - [ ] Split view renders correctly
  - [ ] Color coding visible on added/removed lines
  - [ ] Line numbers aligned
  - [ ] Responsive stacked mode works

- [ ] 7. Refine settings page

  **What to do**:
  - Watch directory section: input with folder icon, focus highlight
  - Behavior section: 3 toggle switches with labels + descriptions
  - Each toggle: focused = red border + dark bg, ON = green toggle, OFF = gray
  - Save + Reset buttons: premium styling, keyboard hints
  - Save toast: "✓ settings saved" (green, 2s)
  - Settings persisted to `~/.klair/settings.json`

  **Must NOT do**:
  - Don't change the settings data model

  **References**:
  - `src/components/settings.tsx` — current settings

  **Acceptance Criteria**:
  - [ ] All fields focusable and navigatable
  - [ ] Toggles respond to Enter and click
  - [ ] Save persists to disk
  - [ ] Toast feedback on save

- [ ] 8. Polish status bar + command palette

  **What to do**:
  - Status bar: clean 1-line footer with keyboard hints
    - `/ commands  ·  arrows navigate  ·  enter select  ·  esc back  ·  ? help  ·  q quit`
    - Right side: `ready` or `stopped` status
    - Toast messages override hints when active
  - Command palette: polished overlay with `/` prefix commands
    - Fuzzy search with real-time filtering
    - Focused item with `▶` pointer + red bg
    - Footer with nav hints

  **Must NOT do**:
  - Don't remove existing functionality

  **References**:
  - `src/components/status-bar.tsx` — current status bar
  - `src/components/command-palette.tsx` — current palette

  **Acceptance Criteria**:
  - [ ] Status bar shows clean shortcuts
  - [ ] Command palette opens on `/`
  - [ ] Fuzzy search works
  - [ ] All commands executable

- [ ] 9. Refine theme colors

  **What to do**:
  - Ensure color palette is consistent across all pages
  - Key colors: `accent` (Tuscan Red #A91B18), `cerulean` (#CEE7F3), `success` (#4C8258)
  - Backgrounds: `bg` (#0A0A0A), `bgElevated` (#1A1A1A), `bgActive` (#2A0A08)
  - Text: `text` (#E8E8E8), `textMuted` (#888888), `textDim` (#555555)
  - Borders: `border` (#333333)
  - Add any missing colors needed by the pixel art logo

  **Must NOT do**:
  - Don't change existing color names (they're used everywhere)

  **References**:
  - `src/theme.ts` — current theme

  **Acceptance Criteria**:
  - [ ] All colors defined and consistent
  - [ ] No hardcoded hex values in components (use theme)

- [ ] 10. Final integration test

  **What to do**:
  - Verify `klair --version` boots
  - Verify `klair watch [dir]` starts daemon + launches TUI
  - Verify all pages navigate correctly
  - Verify keyboard shortcuts work
  - Verify focus system works across all pages
  - Verify pixel art logo renders on startup + dashboard

  **Must NOT do**:
  - Don't skip this step — critical for ship-readiness

  **Acceptance Criteria**:
  - [ ] `klair --version` shows logo + version
  - [ ] All pages navigable via tabs
  - [ ] Arrow keys navigate focusable elements
  - [ ] `/` opens command palette
  - [ ] `?` shows help overlay
  - [ ] `w` opens web GUI toast
  - [ ] `q` quits gracefully
  - [ ] No console errors

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Agent-Executed QA**: Yes — verify via `node --check` + `klair --version` + `klair status`

### QA Policy
Every task verified by the executing agent:

```
Scenario: All files pass syntax check
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. node --check src/utils/logo-pixel.ts
    3. node --check src/components/startup.tsx
    4. node --check src/components/dashboard.tsx
    5. node --check for all other changed files
  Expected Result: All pass with no errors

Scenario: klair boots after changes
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. node bin/klair.js --version
  Expected Result: KLAIR logo + v0.3.0 shown

Scenario: klair status works
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. node bin/klair.js status
  Expected Result: Daemon status shown (active or stopped)
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation):
├── Task 1: Create logo-pixel.ts [deep]
├── Task 9: Refine theme.ts [quick]
└── Task 10: Verify architecture unchanged [quick]

Wave 2 (Core pages — all depend on Wave 1):
├── Task 2: Rebuild startup.tsx [deep]
├── Task 3: Rebuild dashboard.tsx [deep]
└── Task 4: Rebuild header.tsx [quick]

Wave 3 (Secondary pages — all depend on Wave 2):
├── Task 5: Refine events.tsx [quick]
├── Task 6: Refine diff-viewer.tsx [quick]
└── Task 7: Refine settings.tsx [quick]

Wave 4 (Polish — depends on Wave 3):
├── Task 8: Polish status-bar + command-palette [quick]
└── Task 10: Final integration test [quick]
```

Max parallelism: 3 tasks per wave.

### Commit Strategy
- **1**: `feat(tui): pixel art logo + unified startup`
- **2**: `feat(tui): rebuilt dashboard + header`
- **3**: `feat(tui): refined timeline + diff + settings`
- **4**: `chore(tui): final polish + integration`

---

## Success Criteria

### Final Checklist
- [ ] ANSI pixel art KLAIR logo renders on startup + dashboard
- [ ] "Observing the Agent Era" tagline visible
- [ ] `klair watch [dir]` → seamless startup → TUI
- [ ] All 4 pages navigable + functional
- [ ] Keyboard focus system works everywhere
- [ ] Command palette with `/` commands
- [ ] Help overlay with `?`
- [ ] Graceful exit with `q` or Ctrl+C
- [ ] Responsive layout (compact/spacious)
- [ ] No console errors
- [ ] Feels premium, exclusive, worth $50/month
