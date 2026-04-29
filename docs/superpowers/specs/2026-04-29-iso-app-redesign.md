# iso-app Redesign Spec
**Date:** 2026-04-29  
**Status:** Approved  
**Scope:** Full redesign of iso-app — UI, navigation, new modules, cloud routines

---

## Context

iso-app is a personal life OS built on Next.js 16, GitHub as database (markdown files in `iso-life` repo), and Google APIs. Phase 1 shipped five pages (Today, Finance, Dashboard, Projects, Capture) but the app feels passive — it displays data rather than acting as a life companion.

The goal of this redesign is to make iso-app the **visual cockpit** that complements two other layers:
- **Claude/Cowork** — deep work, planning, memory (runs on the Mac)
- **Cloud routines** — autonomous sub-agents that run 24/7 via GitHub Actions + Anthropic API, write results to markdown, surface them in iso-app

The user works at a desktop during weekdays and switches to mobile after hours. Both must feel excellent.

---

## Design System

### Font
- **Headings:** Satoshi (already in project via `@fontsource/satoshi`)
- **Body/UI:** Geist (ships with Next.js 15, clean system-level feel)
- **Numbers/mono:** Geist Mono

### Color
Pure black/white base using shadcn/ui v4 zinc scale:
- Dark mode: `zinc-950` bg, `zinc-900` surface, `zinc-800` border
- Light mode: `white` bg, `zinc-50` surface, `zinc-200` border
- **Single accent:** green `#7dd870` (dark) / `#3aa635` (light) — used only for: streak indicators, live/active states, positive financial deltas, heartbeat dot
- All other UI: zinc grays

### Components
shadcn/ui v4 throughout. Key components:
- `Sidebar` + `SidebarProvider` — desktop navigation shell
- `Card`, `CardHeader`, `CardContent` — feed and stat cards
- `Badge` — status indicators (active, running, alert)
- `Sheet` — mobile drawers and overflow navigation
- `Dialog` — mission creation, habit setup
- `Progress` — loan payoff, mission progress, habit streaks
- `Tabs` — within-page section switching
- `Button` — primary actions (approve, capture, run now)
- `Separator` — visual dividers

---

## Information Architecture

### Routes
```
/ → redirect to /today

/today          ← primary view (replaces both /today and /dashboard)
/finance        ← finance hub (existing, redesigned)
/projects       ← projects overview (existing, redesigned)
/capture        ← simplified capture (mobile: center tab, desktop: right column widget)
/missions       ← new: create + manage autonomous Claude missions
/habits         ← new: daily habit tracker with streaks + heatmaps
/routines       ← new: view all cloud routines, trigger manually, see history
```

`/dashboard` is removed — its content (alerts, stats, session notes) moves into the feed column of `/today`.

### Data files (iso-life repo)
```
missions/
  missions.md             ← active mission definitions (table)
  results/
    YYYY-MM-DD-[name].md  ← per-mission Claude output

routines/
  heartbeat/
    YYYY-MM-DD.md         ← daily heartbeat output
  weekly/
    YYYY-WW.md            ← weekly review output
  finance-snapshot/
    YYYY-MM.md            ← monthly net worth rows

habits/
  YYYY-MM.md              ← monthly habit log (checkbox markdown)
  config.md               ← habit definitions (name, emoji, target)
```

---

## Desktop Layout

Uses shadcn `AppSidebar` pattern (dashboard-01 style). Replaces current top nav bar entirely on desktop.

```
┌──────────────┬─────────────────────┬──────────────────┬─────────────────┐
│  SIDEBAR     │   YOUR DAY          │   THE FEED       │  QUICK ACTIONS  │
│  (collapsible│   (left col)        │   (center col)   │  (right col)    │
│   left)      │                     │                  │                 │
│              │  [Date + greeting]  │  Heartbeat card  │  [+ Capture]    │
│  ⌂ Today     │                     │  (pinned, fresh) │                 │
│  ◈ Finance   │  Calendar           │  ──────────────  │  [⏱ Pomodoro]  │
│  ▤ Projects  │  (today, 3 items)   │  Routine results │                 │
│  ✦ Capture   │  ─────────────────  │  (last 24h)      │  Habits today   │
│  ⟶ Missions  │  Tasks              │  ──────────────  │  (check-in)     │
│  ◎ Habits    │  (today's focus)    │  Mission updates │                 │
│  ─────────── │  ─────────────────  │  (propose/act)   │  Active mission │
│  ◷ Routines  │  Finance pulse      │  ──────────────  │  (running...)   │
│  ─────────── │  (critical only)    │  Alert cards     │                 │
│  ⚙ Settings  │                     │                  │                 │
└──────────────┴─────────────────────┴──────────────────┴─────────────────┘
```

**Sidebar behavior:**
- Expanded (icon + label) at ≥1280px
- Collapsed (icon only) at 1024–1279px
- Hidden (mobile nav takes over) below 1024px
- Collapse toggle button at bottom of sidebar

**Three content columns:**
- Left (Your Day): `w-72`, fixed
- Center (Feed): `flex-1`, scrollable
- Right (Quick Actions): `w-64`, sticky, scrolls independently

On medium screens (1024–1279px), right column drops below center in a 2-row layout.

---

## Mobile Layout

### Bottom tab bar (5 tabs)
```
[ Today ] [ Finance ] [ Capture ] [ Missions ] [ More ]
   ⌂          ◈           ✦            ⟶          ···
```

"More" opens a `Sheet` from the bottom with: Habits, Projects, Routines, Settings.

Tabs use shadcn-compatible components with `safe-area-inset-bottom` padding. Active tab uses accent green dot indicator, not color fill.

### Time-aware Today scroll (mobile)

Cards reorder based on time of day (Paris timezone):

**Before 10am:**
1. Heartbeat pulse (Claude's morning brief)
2. Calendar (today's events)
3. Tasks (focus for today)
4. Morning habit check-in

**10am – 6pm:**
1. Active pomodoro (if running) or start button
2. Tasks (current focus)
3. Mission updates (proposals waiting)
4. Alerts (if any)

**After 6pm:**
1. Evening habit check-in
2. Today's summary (what was completed)
3. Tomorrow preview (first calendar event + top task)
4. Weekly review prompt (Sundays only)

---

## The Feed

The center column on desktop / primary scroll on mobile. All items are cards.

### Heartbeat Card (pinned)
- Pinned at top of feed, always the first thing seen
- Shows: Claude's 3-sentence daily pulse (plain language, not data)
- Example: *"You're 18 days from clearing Revolut — on track. DigiBuntu has been quiet for 9 days; consider a decision checkpoint. Your habit streak is at 14."*
- Footer: "Generated today at 7:12am · Expand"
- Expand → full analysis in a `Sheet`
- Accent green pulsing dot = freshly generated (within 4h)

### Routine Result Cards
- One card per routine that ran in the last 24h
- Shows: routine name, run time, 1-paragraph summary
- Collapsed by default, expand to see full output

### Mission Update Cards
- Appear when a mission produces a result with a proposal
- Layout: mission name + last-run time → summary paragraph → quoted proposal block → `[Approve]` `[Dismiss]` buttons
- Approve → writes `approved: true` to the result file's frontmatter via GitHub API, then dispatches `mission-runner.yml` with `mode=execute` + `result_file=path` — the Action re-reads the file and carries out the proposed action (e.g. updating a project note, adding a task)
- Dismiss → writes `dismissed: true` to result frontmatter; card disappears from feed

### Alert Cards
- Red `border-l-2 border-red-500` left accent
- Finance deadlines, stale projects, overdue tasks
- Dismissible (writes dismissed state to `alerts/dismissed.md`)

---

## Missions Page (`/missions`)

### Active missions list
Each mission card shows:
- Goal text (plain English, truncated at 2 lines)
- Cadence badge (daily / weekly / monthly / on-demand)
- Last run: relative time + status (success / failed / never)
- Last result: 1-sentence excerpt
- Actions: `[Run now]` `[Pause]` `[Delete]`

### Create mission dialog
Triggered by `[+ New Mission]` button. Fields:
- **Goal** — textarea, plain English ("Every Monday, review my DigiBuntu pipeline...")
- **Cadence** — segmented: Daily / Weekly / Monthly / On-demand
- **Context** — checkboxes: Finance data / Projects / Habits / All memory files
- **Name** — auto-generated from goal, editable

On submit → appends row to `iso-life/missions/missions.md` via GitHub write API.

### missions.md format
```markdown
| Name | Goal | Cadence | Context | Status | Created |
|------|------|---------|---------|--------|---------|
| revolut-tracker | Track progress toward paying off Revolut by May 2026 | weekly | finance | active | 2026-04-29 |
```

---

## Habits Page (`/habits`)

### Layout
Grid of habit cards (2 cols desktop, 1 col mobile).

Each card:
- Habit name + emoji
- Current streak: large number + "day streak"
- Last 30 days: dot grid heatmap (filled = done, accent green)
- Today's status: `[Done ✓]` (if checked) or `[Check in]` button
- Check-in → writes to `habits/YYYY-MM.md`

### habits/YYYY-MM.md format
```markdown
# Habits — April 2026

| Date | Exercise | Reading | No-alcohol | Deep work |
|------|----------|---------|------------|-----------|
| 2026-04-01 | ✓ | ✓ | ✓ | - |
| 2026-04-02 | - | ✓ | ✓ | ✓ |
```

### habits/config.md format
```markdown
| Name | Emoji | Target | Active |
|------|-------|--------|--------|
| Exercise | 🏃 | daily | true |
| Reading | 📖 | daily | true |
```

---

## Pomodoro (Quick Actions panel / mobile Today)

Minimal implementation. State stored client-side (no persistence needed).

- 25min work / 5min break / 15min long break
- Display: large circular timer, current session type
- Controls: Start / Pause / Reset / Skip
- On completion: increments session count, plays notification (if permission granted)
- Session count shown in Quick Actions panel

---

## Cloud Routines & GitHub Actions

### New API route: `/api/github/dispatch`
```
POST /api/github/dispatch
Body: { workflow: string, inputs?: Record<string, string> }
```
Calls GitHub's `workflow_dispatch` API endpoint. Returns `{ dispatched: true }` immediately — fire and forget.

### GitHub Actions workflows (in `iso-life/.github/workflows/`)

**`heartbeat.yml`**
- Schedule: `0 7 * * *` (7am Paris = 6am UTC)
- Manual: `workflow_dispatch`
- Steps: checkout → read CONTEXT.md + PROJECTS.md + habits last 7d + missions.md → call Anthropic API (claude-sonnet-4-6) → write `routines/heartbeat/YYYY-MM-DD.md`
- Output format: frontmatter (generated_at, model) + 3-sentence pulse + full analysis section

**`mission-runner.yml`**
- Schedule: `0 6 * * *` (runs daily, filters by cadence internally)
- Manual: `workflow_dispatch` with input `mission_name` (optional, runs all if omitted)
- Steps: checkout → parse missions.md → for each due mission: build context from specified files → call Anthropic API → write `missions/results/YYYY-MM-DD-[name].md`
- Output format: frontmatter (mission, cadence, status) + findings + `## Proposed Action` section

**`weekly-review.yml`**
- Schedule: `0 20 * * 0` (Sunday 8pm Paris)
- Manual: `workflow_dispatch`
- Steps: checkout → read full week of daily logs + habits + project notes → call Anthropic API → write `routines/weekly/YYYY-WW.md`

**`finance-snapshot.yml`**
- Schedule: `0 9 1 * *` (1st of each month, 9am)
- Manual: `workflow_dispatch`
- Steps: checkout → read CONTEXT.md balances → append row to `Personal Finances/memory/net_worth.md` → commit

**`habit-report.yml`**
- Schedule: `0 0 * * *` (midnight daily)
- Steps: checkout → read habits/YYYY-MM.md → calculate streaks → write `routines/habit-report/YYYY-MM-DD.md`

### Required GitHub Actions secrets
```
ANTHROPIC_API_KEY    ← Anthropic API key (never in iso-app)
GH_TOKEN             ← PAT with repo scope (for commit back)
```

---

## Implementation Phases

### Phase A — Foundation (do first)
1. Install shadcn/ui v4, configure with zinc theme + Satoshi/Geist fonts
2. Build `AppSidebar` component replacing current top nav
3. Rebuild `/today` as 3-column layout (desktop) + time-aware scroll (mobile)
4. Redesign Feed column with Heartbeat card + skeleton cards
5. Mobile bottom tab bar (5 tabs + More sheet)

### Phase B — New pages
6. `/habits` page + check-in write to GitHub
7. `/missions` page + create mission dialog + write to missions.md
8. `/routines` page — list all routines with last-run status + Run Now button

### Phase C — Quick Actions
9. Right column widgets: Capture inline, Pomodoro timer, Habit check-in
10. `/api/github/dispatch` route for workflow triggering

### Phase D — Cloud routines
11. `heartbeat.yml` GitHub Action (reads context, calls Anthropic API)
12. `mission-runner.yml` GitHub Action
13. `weekly-review.yml`, `finance-snapshot.yml`, `habit-report.yml`

### Phase E — Polish
14. Redesign `/finance` with shadcn cards + improved chart
15. Redesign `/projects` with shadcn cards
16. Light/dark mode toggle in sidebar footer
17. Mobile time-aware card reordering logic

---

## Verification

- `npm run dev` → open localhost:3000, confirm redirect to `/today`
- Desktop at 1440px: sidebar visible, 3 columns render correctly
- Desktop at 1024px: sidebar collapses to icons, right column drops
- Mobile (375px): bottom tab bar visible, Today scroll renders
- Heartbeat card: shows placeholder "No heartbeat yet" if no markdown exists
- Mission create: submit form → confirm `missions.md` updated in iso-life via GitHub API
- Habit check-in: tap Done → confirm `habits/YYYY-MM.md` updated
- Run Now (routines): button triggers dispatch → GitHub Actions tab shows workflow queued
- Feed cards: approve/dismiss a mission result → result file updated
