# Production Planner — Claude Code Handoff

**Last updated:** 2026-05-18  
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
  created_at TIMESTAMPTZ DEFAULT NOW()
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

Status badge colors: In Production `#38BDF8` · Ready to Ship `#22c55e` · Delayed `#ef4444` · On Hold `#FF8C00` · Cancelled `#FF1744`

---

## Current State

### Working
- Full build — zero errors, zero warnings
- All 5 Phase 1 features fully implemented and verified
- Deployed to production: https://production-planner-one.vercel.app
- Supabase connected and RLS configured on all three tables

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

1. **Phase 2 — Warehouse route**: `/warehouse` — read-only view, In Production + Ready to Ship only, no Edit/Archive/Delete. Large-format display similar to the shipment tracker warehouse view.

2. **Notes author** — either add a simple "Your name" prompt that persists in localStorage, or integrate with Supabase Auth if auth is ever re-added.

3. **Search bar** — add a text search input above the table filtering by customer, PO#, or coating. Pattern exists in the shipment tracker (`SearchFilterBar.jsx`).

4. **Pagination** — add if order counts grow large. `Pagination.jsx` component already exists in the shipment tracker.
