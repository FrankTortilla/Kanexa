# Production Planner — Claude Code Handoff

**Last updated:** 2026-05-19 (main reset to b588e12e6 + stabilized fix series)
**Repo:** https://github.com/FrankTortilla/Kanexa.git  
**Branch:** main  
**Project path in repo:** `production-planner/`  
**Live URL:** https://production-planner-one.vercel.app  
**Sister app:** `shipment-tracker/` (same repo, same stack — use it as a reference)

---

## Purpose

Office-facing production order management tool for Green Steel. Staff create and track production orders across three product lines (Baskets, Loose Dowels, EpoxyFab), monitor urgency (CPU ASAP), and export data to CSV. Phase 1 is office-only. Phase 2 (not built) will add a warehouse-facing route.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.2 (App Router, `'use client'` pages) |
| Database | Supabase (PostgreSQL) — project `ntfblbamjejyctcgtmls` |
| Realtime | Supabase `postgres_changes` subscription |
| Styling | Tailwind CSS v4 + inline styles (no CSS modules) |
| Fonts | Oswald (headings) + IBM Plex Sans (body) via next/font/google |
| Hosting | Vercel — Project `production-planner`, alias `production-planner-one.vercel.app` |
| Language | JavaScript (no TypeScript) |

---

## Supabase Setup

Credentials go in `production-planner/.env.local` (not committed):

```
NEXT_PUBLIC_SUPABASE_URL=https://ntfblbamjejyctcgtmls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key in Vercel env vars>
```

`src/lib/supabase.js` returns `null` if credentials are missing — all hooks and components guard against a null client, so the app loads without crashing when unconfigured.

### Tables

All four production planner tables exist in Supabase with RLS enabled:

| Table | Rows | RLS | Notes |
|---|---|---|---|
| `production_orders` | 5 | ✓ | Main orders table |
| `production_order_activity` | 27 | ✓ | System-generated change log |
| `production_order_notes` | — | ✓ | User-authored notes (new) |

All three tables share the same open-anon RLS policy pattern:  
`FOR ALL TO anon USING (true) WITH CHECK (true)`

### Schema

```sql
CREATE TYPE order_type AS ENUM ('Baskets', 'Loose Dowels', 'EpoxyFab');
CREATE TYPE order_status AS ENUM ('In Production', 'Ready to Ship', 'Delayed', 'On Hold', 'Cancelled');
CREATE TYPE coating_type AS ENUM ('Plain', 'Epoxy', 'Epoxy/Tectyl', 'Epoxy/Patch', 'Painted', 'Other');

CREATE TABLE production_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type order_type NOT NULL,
  start_date DATE,
  due_date DATE,
  customer TEXT,
  po_number TEXT,
  quantity INTEGER,
  pvg TEXT,
  dowel_size TEXT,
  oc TEXT,
  coating coating_type,
  coating_other TEXT,
  num_dowels INTEGER,
  total_lf INTEGER,
  status order_status NOT NULL DEFAULT 'In Production',
  cpu_asap BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  bar_size TEXT,
  bar_length TEXT,
  weight NUMERIC,
  tolling_only BOOLEAN NOT NULL DEFAULT false,
  fabrication TEXT,
  description TEXT
);

CREATE TABLE production_order_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_order_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## File Structure

```
production-planner/
├── .claude/launch.json          # Dev server config (port 3001)
├── .env.local                   # Supabase credentials (not committed)
├── .vercel/project.json         # Vercel project linkage
├── CLAUDE.md                    # Project reference doc
├── HANDOFF.md                   # This file
├── package.json
├── next.config.mjs
└── src/
    ├── app/
    │   ├── globals.css          # CSS variables, animations
    │   ├── layout.js            # Root layout, fonts, metadata
    │   └── page.js              # Main page (all state lives here)
    ├── components/
    │   ├── Header.jsx           # Sticky header: brand, tabs, action buttons
    │   ├── DashboardSummary.jsx # Clickable stat cards — filter by status
    │   ├── OrderTable.jsx       # Main data table (Active + History modes)
    │   ├── OrderForm.jsx        # Slide-out panel: add/edit orders
    │   ├── StatusBadge.jsx      # Read-only color-coded status pill
    │   ├── ActivityLog.jsx      # Activity log + Notes section (expandable row)
    │   └── EmptyState.jsx       # Empty state (Active / History / filter variants)
    ├── hooks/
    │   └── useOrders.js         # Supabase CRUD + realtime + delete
    └── lib/
        ├── supabase.js          # Supabase client (returns null if unconfigured)
        └── constants.js         # ORDER_TYPES, ORDER_STATUSES, COATING_TYPES, STATUS_BADGE_COLORS
```

> `ArchivedOrders.jsx` has been superseded by the in-tab History view and can be deleted.

---

## Features (Phase 1 — Complete)

### Header
- App title with Green Steel logo + Caspr badge
- Three product tabs: **Baskets | Loose Dowels | EpoxyFab** with active count badges
- **+ Add Order** and **↓ CSV** buttons

### Dashboard Summary (stat cards)
- **Clickable filter cards** per active tab: In Production / Ready to Ship / Delayed / On Hold / Total Active
- Clicking a card filters the table below to show only matching orders
- Selected card shows highlighted border + brightness; clicking again deselects
- Filter resets automatically when switching product tabs
- **Total QTY** and **Total LF** metric tiles (global, non-clickable)

### Active / History Sub-tabs
- **Active** (default): non-archived, non-cancelled orders for the current product tab
- **History**: archived orders + Cancelled orders for the current product tab
- Switching product tabs resets both the sub-tab to Active and any active filter
- Count badges on each sub-tab update live

### Order Table (Active mode)
- 14 columns: Start Date, Due Date, Customer, PO#, Qty (ea), Pvg", Dowel Size, O.C., Coating, # Dowels, Total LF, Status, CPU ASAP, Actions
- Default sort: Due Date ascending; CPU ASAP rows pinned to top with amber highlight
- **Status** column: inline dropdown (portal-based to escape overflow clipping)
- Changing status to Cancelled auto-archives the order and moves it to History
- **Actions column**: `···` dropdown button with Edit / Archive / Delete
  - Edit: opens edit form
  - Archive: moves to History immediately
  - Delete: shows confirmation dialog before permanent delete

### Order Table (History mode)
- Same columns, read-only — Status is a static badge, no Edit button
- **Actions column**: `···` dropdown with Restore / Delete
  - Restore: moves back to Active
  - Delete: same permanent delete confirmation

### Add / Edit Order Form
- All fields with validation (Due Date ≥ Start Date)
- Cancelled orders auto-archived on save
- `coating_other` correctly re-populated on edit

### Activity Log + Notes (expandable row)
- Expand any row with ▶ to open the panel
- **Activity Log**: system-generated entries (field changes, status changes, archive/restore), newest first, blue dot indicator
- **Notes**: user-authored notes stored in `production_order_notes`, chronological, gray dot indicator
  - Empty note prevention: Add Note button disabled until text is entered
  - Supabase write error shown inline
  - Supports long notes (word-wrap, pre-wrap)
  - Notes scoped to order by `order_id`

### Realtime
- `postgres_changes` subscription on `production_orders`
- All tabs, inserts, updates (including archive/restore), and deletes reflected immediately
- Brief flash animation on changed rows

### CSV Export
Exports currently visible orders (respects Active/History view and active filter).

---

## Key Design Decisions

- **`useOrders` fetches ALL orders** (active + archived) so the History sub-tab can filter client-side without a second query. Realtime events update state for both views.
- **`archived` column (boolean)** is the archive flag. Column name is `archived`, not `is_archived`.
- **Status filter is per product-tab** — stored as a single `statusFilter` state that resets on `handleTabChange`. Switching Active/History sub-tabs does NOT reset the filter (intentional: filter stays when toggling view).
- **Single open dropdown** — `openDropdownId` is lifted to `OrderTable` level so only one `···` dropdown can be open at a time. The effect also auto-closes the dropdown if its row is removed from view.
- **Error surface** — Archive, Restore, Delete, and Status Change failures show a red error banner (top-right, 5s timeout) in addition to reverting any optimistic UI state.

---

## Color Scheme

| Token | Value |
|---|---|
| Background | `#1a1a1a` |
| Surface / tiles | `#1E293B` |
| Table header bg | `#363636` |
| Primary green | `#96ba94` (sage green) |
| CPU ASAP amber | `#FF8C00` |
| Text primary | `#CBD5E1` |
| Text secondary | `#a0a0a0` |
| Border | `#333333` |
| Row hover | `#2e2e2e` |

Status badge colors: In Production `#3b82f6` · Ready to Ship `#22c55e` · Delayed `#e6b800` · On Hold `#FF8C00` · Cancelled `#FF1744`

---

## Current State

### 2026-05-19 Stabilization Update
- Preserved the previously dirty/deployed state on branch `codex-safety-before-production-planner-stabilize`, commit `5b688b79c`.
- Reset local `main` to `origin/main` / `b588e12e6`.
- Cherry-picked the coherent stabilization series onto `main`:
  - `2ac7414a5` — baseline cleanup: removed stale EpoxyFab Dowel Size handling, fixed the Tolling Only field name, scoped stat calculations.
  - `4bd6ce4c0` — tab-specific table columns and EpoxyFab field visibility.
  - `05081f4e4` — scrollbar colors match Waypoint.
  - `91cd32f9c` — sticky header and single-page scroll.
  - `6880d9664` — status dropdown flips upward near viewport bottom.
- The old misspelled Tolling Only field name no longer appears in `HANDOFF.md` or `src`.
- Current code expects Supabase column `tolling_only`.
- Current code uses `total_lf`; there is no `lf` field in the app code.
- Live Supabase schema has not been verified in this session:
  - `.env.local` is absent in this checkout.
  - `vercel env pull --environment=production` returned an empty file when retried.
  - Supabase MCP tools were not available in this session.
- Local/remote verification status:
  - `npm run lint` still fails before source linting with ESLint config error: `TypeError: Converting circular structure to JSON`.
  - `npm run build` was attempted after stabilization but failed because local DNS could not resolve `fonts.googleapis.com`; `curl` also returned `Could not resolve host` and `scutil --dns` reported no DNS configuration.
  - Vercel remote production build passed and was deployed.
- Deployment:
  - Production alias: https://production-planner-one.vercel.app
  - Deployment URL: https://production-planner-8h9ofbbx8-steve-6797s-projects.vercel.app
  - Deployment id: `dpl_B7ZzXBGzbnHg93eqNWNrGzsKVe6V`
  - Vercel CLI again reported post-deploy cache write `EPERM` warnings under `~/Library/Caches/com.vercel.cli/package-updates/` after the deployment was already `READY` and aliased.

### Working
- Core stabilization code is applied on `main`.
- Dynamic EpoxyFab fields use `tolling_only` consistently in current source.
- Active/History, notes, action dropdown, tab-specific columns, and status-card filtering are present in source.
- Existing production alias https://production-planner-one.vercel.app now points at the stabilized deployment listed above.

### Edge Cases Verified
- Zero-order tab: stat cards show 0, table shows empty state message
- Clicking a 0-count stat card: shows "No orders match this filter" empty state
- Filter reset on tab switch: confirmed
- Stat card counts update in real-time via Supabase realtime subscription
- Empty note blocked: Add Note button disabled until text entered
- Note save failure: inline error shown
- Notes scoped to order_id: separate queries per expanded row
- Long notes: `wordBreak: break-word`, `whiteSpace: pre-wrap`
- Status update failure: badge reverts + error banner
- Archive/Restore failure: error banner, no optimistic state left orphaned
- Archive last order: table shows empty state, not broken layout
- Archive twice: impossible — archived orders are in History (no Archive button)
- History read-only: StatusBadge (not dropdown), no Edit in Actions menu
- Delete with confirmation: Cancel is safe, Escape closes dialog, no accidental deletes
- Delete failure: order stays visible, error banner shown
- Dropdown orphan prevention: `useEffect` in OrderTable closes dropdown when its row leaves view
- Dropdown scroll close: scroll event listener in ActionsDropdown

### Known Gaps / Not Built
- **Supabase schema verification** — still needs a live check that `bar_size`, `bar_length`, `weight`, `tolling_only`, `fabrication`, and `description` exist on `production_orders`.
- **Local build verification** — blocked by local DNS failure fetching Google Fonts.
- **Lint tooling** — blocked by existing ESLint config crash before app code is linted.
- **Pagination** — table renders all orders for a tab/view. Fine for current volume.
- **Search/filter bar** — not in original spec. Could be added.
- **Warehouse route** — Phase 2. Not started. Would be `/warehouse`, read-only, In Production + Ready to Ship only.
- **Notes author field** — `production_order_notes.author` column exists but UI doesn't ask for author name. Would require either a login or a name prompt.
- `--accent-green-hover: #5a9a4a` in `globals.css` is unused.
- `ArchivedOrders.jsx` component is no longer used (superseded by in-tab History) — safe to delete.

---

## Running Locally

```bash
cd production-planner
npm install
# .env.local already exists with Supabase credentials
npm run dev   # → http://localhost:3001
```

Dev server config: `production-planner/.claude/launch.json`

---

## Deployment

```bash
cd production-planner
vercel --prod
```

Vercel project is linked via `.vercel/project.json`. Env vars are set in the Vercel dashboard.

---

## Next Steps

1. Verify or run the Supabase migration for `bar_size`, `bar_length`, `weight`, `tolling_only`, `fabrication`, and `description`.

2. Re-run `npm run build` once local DNS is working; remote Vercel build already passed for the stabilized deployment.

3. Fix or update the ESLint config so `npm run lint` can execute against source files again.

4. **Phase 2 — Warehouse route**: `/warehouse` — read-only view, In Production + Ready to Ship only, no Edit/Archive/Delete. Large-format display similar to the shipment tracker warehouse view.

5. **Notes author** — either add a simple "Your name" prompt that persists in localStorage, or integrate with Supabase Auth if auth is ever re-added.

6. **Search bar** — add a text search input above the table filtering by customer, PO#, or coating. Pattern exists in the shipment tracker (`SearchFilterBar.jsx`).

7. **Pagination** — add if order counts grow large. `Pagination.jsx` component already exists in the shipment tracker.
