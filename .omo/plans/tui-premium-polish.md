# Premium KLAIR TUI Final Polish — Work Plan

## TL;DR

> **Deliverable**: 4 files refined for world-class premium terminal experience — smoother spinner, better card borders, event type badges, refined visual hierarchy across dashboard and timeline
> 
> **Estimated Effort**: Quick (4 files, ~100 lines changed)
> **Parallel Execution**: YES — all 4 files are independent

---

## Context

The KLAIR TUI v0.3.0 has been rebuilt across multiple sessions with:
- Dark theme (#0A0A0A bg, #A91B18 accent)
- 8-bit KLAIR logo in startup + dashboard hero
- Focus system with arrow key navigation
- Card component with title/body separation
- Dashboard with session/health/actions/recent cards
- Events timeline with search/filter/pagination
- Split-view diff viewer
- Settings with focusable toggles
- Command palette with /commands format
- Status bar with shortcuts
- Graceful Ctrl+C exit

The final polish items are small refinements that elevate the premium feel.

---

## Work Objectives

### Core Objective
Apply final premium polish to spinner animation, card borders, event badges, and visual hierarchy for a world-class terminal experience.

### Concrete Deliverables
- `packages/cli/src/components/spinner.tsx` — 6-frame smoother animation
- `packages/cli/src/components/card.tsx` — uppercase titles, refined borders
- `packages/cli/src/components/dashboard.tsx` — event type badges, refined hero
- `packages/cli/src/components/events.tsx` — better rows, responsive paths

---

## TODOs

- [ ] 1. Polish spinner: 6 frames at 80ms for smoother animation

  **What to do**:
  - Replace 4-frame braille spinner with 6 frames: `["⠋","⠙","⠚","⠞","⠸","⠴"]`
  - Change interval from 100ms to 80ms for smoother feel
  - Remove unused `Box, Text` import from `@opentui/react`

  **Must NOT do**:
  - Don't change the component API (props stay same)
  - Don't add CSS animations (OpenTUI is terminal-only)

  **References**:
  - `packages/cli/src/components/spinner.tsx` — current 4-frame implementation

  **Acceptance Criteria**:
  - [ ] 6 Unicode braille characters in FRAMES array
  - [ ] Interval set to 80ms
  - [ ] No unused imports
  - [ ] `node --check` passes

- [ ] 2. Refine Card: uppercase title, border wrapping, more padding

  **What to do**:
  - Title text: use `.toUpperCase()` on title string
  - Title bar: add `borderStyle="single"` to match body border
  - Title bar: change paddingX from 1 to 2 for more breathing room
  - Body box: add `borderStyle="single"` directly (currently inherited from parent)
  - Body box: add explicit `borderColor={borderColor}` prop

  **Must NOT do**:
  - Don't change the component API (props stay same)
  - Don't add new colors

  **References**:
  - `packages/cli/src/components/card.tsx` — current card implementation

  **Acceptance Criteria**:
  - [ ] Card titles rendered as UPPERCASE
  - [ ] Title bar has visible single border
  - [ ] Body has visible single border
  - [ ] Both title bar and body use the same `borderColor`

- [ ] 3. Premium dashboard: event type badges, refined labels

  **What to do**:
  - Add `badgeType()` helper function — maps "add"→"create", "unlink"→"delete", "change"→"modify"
  - Add `badgeColor()` helper function — returns accent color per event type
  - In recent activity section: wrap event type text in a colored background box (like a badge)
  - Pad event IDs to 3 chars: `String(evt.id).padStart(3, " ")`
  - Change "last" label to "last event" in health card for clarity
  - Change compact mode threshold to `height < 26 || width < 80` for slightly earlier compact switch
  - Compact paddingY from 0 to 2 for more vertical breathing room
  - Hero area: add `·` separator between watching path and PID
  - Change event type labels: "add"→"create", "unlink"→"delete"

  **Must NOT do**:
  - Don't change the overall layout structure
  - Don't add new hooks or external dependencies

  **References**:
  - `packages/cli/src/components/dashboard.tsx` — current dashboard implementation
  - `packages/cli/src/theme.ts` — color constants (theme.success, theme.accent, theme.cerulean, theme.diffAdded, theme.diffRemoved)

  **Acceptance Criteria**:
  - [ ] Event types shown as colored badges with background
  - [ ] Event IDs aligned to 3 chars
  - [ ] "last event" label visible in health card
  - [ ] Hero shows `● watching ~/path · pid 12345`
  - [ ] Compact mode triggers at width < 80 or height < 26

- [ ] 4. Premium timeline: better rows, responsive paths, focus borders

  **What to do**:
  - Import `useTerminalDimensions` from `@opentui/react`
  - Add `narrow` variable: `const narrow = width < 90`
  - Focused event rows: add `borderStyle="single"` and `borderColor={theme.accent}` for visible focus ring
  - Event IDs: pad to 3 chars: `String(evt.id).padStart(3, " ")}`
  - File paths: use `narrow ? 24 : 36` for responsive truncation
  - Event type: add `badgeColor()` helper, wrap in small color-indicator box
  - Search bar: remove colons from labels ("search" instead of "search:")
  - Pagination: centre-justified "X / Y" format
  - Pagination buttons: paddingX from 1 to 2

  **Must NOT do**:
  - Don't change the filtering logic
  - Don't add new dependencies

  **References**:
  - `packages/cli/src/components/events.tsx` — current events implementation
  - `packages/cli/src/theme.ts` — color constants

  **Acceptance Criteria**:
  - [ ] Focused events show red border ring
  - [ ] Event IDs 3-char padded
  - [ ] File paths truncated narrower on small terminals
  - [ ] Event types color-coded inline
  - [ ] Search labels clean (no colons)

---

## Verification Strategy

### Test Decision
- **Automated tests**: None (TUI has no test infrastructure)
- **Agent-Executed QA**: Verify via `node --check` + `klair --version`

### QA Policy
Every task verified by the executing agent:

### QA Scenarios

```
Scenario: All 4 files pass syntax check
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. node --check src/components/spinner.tsx
    3. node --check src/components/card.tsx
    4. node --check src/components/dashboard.tsx
    5. node --check src/components/events.tsx
  Expected Result: All 4 pass with no errors
  Evidence: terminal output showing "OK" for each

Scenario: klair still boots after changes
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. node bin/klair.js --version
  Expected Result: KLAIR logo appears, version shows v0.3.0
  Evidence: terminal output showing logo + version

Scenario: All imports resolve correctly
  Tool: Bash
  Steps:
    1. cd packages/cli
    2. Run with bun (bun run src/index.tsx) to check runtime resolution
  Expected Result: No import errors
  Evidence: terminal output showing clean startup
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (All independent):
├── Task 1: Polish spinner.tsx [quick]
├── Task 2: Refine card.tsx [quick]
├── Task 3: Premium dashboard.tsx [quick]
└── Task 4: Premium events.tsx [quick]
```

All 4 tasks are independent — no dependencies between them. Can run in parallel.

### Commit Strategy
- **1**: `chore(tui): final premium polish` — spinner, card, dashboard, events refinements

---

## Success Criteria
- [ ] All 4 files pass `node --check`
- [ ] `klair --version` boots correctly
- [ ] Spinner has 6 frames at 80ms
- [ ] Card titles are UPPERCASE with proper borders
- [ ] Event type badges visible on dashboard
- [ ] Focused events show red border ring
- [ ] Search labels clean (no colons)

---

## After Plan Execution
Run `/start-work` to begin implementation. This plan should complete in under 2 minutes.
