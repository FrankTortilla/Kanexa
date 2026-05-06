# Production Planner — Claude Code Handoff

**Last updated:** 2026-05-01  
**Repo:** https://github.com/FrankTortilla/Kanexa.git  
**Branch:** main  
**Project path in repo:** `production-planner/`  
**Sister app:** `shipment-tracker/` (same repo, same stack — use it as a reference)

---

## Purpose

Office-facing production order management tool for Green Steel. Staff create and track production orders across three product lines (Baskets, Loose Dowels, EpoxyFab), monitor urgency (CPU ASAP), and export data to CSV. Phase 1 is office-only. Phase 2 (not built) will add a warehouse-facing route.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.2 (App Router, `'use client'` pages) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase `postgres_changes` subscription |
| Styling | Tailwind CSS v4 + inline styles (no CSS modules) |
| Fonts | Oswald (headings) + IBM Plex Sans (body) via next/font/google |
| Hosting | Vercel (not yet deployed — see Next Steps) |
| Language | JavaScript (no TypeScript) |

---

## Supabase Setup

Credentials go in `production-planner/.env.local` (not committed):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`src/lib/supabase.js` returns `null` if credentials are missing — all hooks and components guard against a null client, so the app loads without crashing when unconfigured.

### Tables

Run this SQL once in your Supabase project:

```sql
CREATE TYPE order_type AS ENUM ('Baskets', 'Loose Dowels', 'EpoxyFab');
CREATE TYPE order_status AS ENUM ('In Production', 'Ready to Ship', 'Delayed', 'On Hold', 'Cancelled');
CREATE TYPE coating_type AS ENUM ('Plain', 'Epoxy', 'Epoxy/Tectyl', 'Epoxy/Patch', 'Painted', 'Other');

CREATE TABLE production_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type order_type NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer TEXT NOT NULL,
  po_number TEXT,
  quantity INTEGER NOT NULL,
  pvg TEXT,
  dowel_size TEXT,
  oc TEXT,
  coating coating_type NOT NULL,
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
```

---

## File Structure

```
production-planner/
├── .claude/launch.json          # Dev server config (port 3001)
├── .gitignore
├── CLAUDE.md                    # Project reference doc
├── HANDOFF.md                   # This file
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── eslint.config.mjs
├── jsconfig.json
└── src/
    ├── app/
    │   ├── globals.css          # CSS variables, animations
    │   ├── layout.js            # Root layout, fonts, metadata
    │   └── page.js              # Main page (all state lives here)
    ├── components/
    │   ├── Header.jsx           # Sticky header: brand, tabs, action buttons
    │   ├── DashboardSummary.jsx # Total Qty + Total LF summary tiles
    │   ├── OrderTable.jsx       # Main data table (14 columns)
    │   ├── OrderForm.jsx        # Slide-out panel: add/edit orders
    │   ├── StatusBadge.jsx      # Color-coded status pill
    │   ├── ActivityLog.jsx      # Per-order change history (expandable row)
    │   ├── ArchivedOrders.jsx   # Archived view with sub-tabs + Restore
    │   └── EmptyState.jsx       # Empty tab placeholder
    ├── hooks/
    │   └── useOrders.js         # Supabase CRUD + realtime + activity logging
    └── lib/
        ├── supabase.js          # Supabase client (returns null if unconfigured)
        └── constants.js         # ORDER_TYPES, ORDER_STATUSES, COATING_TYPES, STATUS_BADGE_COLORS
```

---

## Features Built (Phase 1)

### Header
- App title "Production Planner" with Green Steel branding
- Three tab filters: **Baskets | Loose Dowels | EpoxyFab**
- Count badge on each tab showing active (non-cancelled, non-archived) orders for that type
- **+ Add Order** button (opens slide-out form)
- **↓ CSV** button (exports currently visible tab's orders)
- **🗄 Archived / ← Active** toggle button (switches between active and archive view)

### Dashboard Summary Tiles
- **Total Qty** — sum of `quantity` across all order types, excluding cancelled and archived
- **Total LF** — sum of `total_lf` across all order types, excluding cancelled and archived
- Updates live as orders are added, edited, archived, or cancelled

### Order Table
Columns in exact order: Start Date | Due Date | Customer | PO# | Qty (ea) | Pvg" | Dowel Size | O.C. | Coating | # Dowels | Total LF | Status | CPU ASAP | Actions

- Default sort: Due Date ascending (most urgent first)
- **CPU ASAP rows** pin to the very top of their tab, with amber (#FF8C00) left border and a subtle amber row tint
- **Status badge** rendered as a color-coded pill per row
- Each row has: **▼/▲** (expand activity log) | **Edit** | **🗄** (archive) buttons
- Activity log expands inline below the row

### Add / Edit Order Form (Slide-out Panel)
All fields from spec:
- Order Type (dropdown, required)
- Start Date (date picker, defaults to today, required)
- Due Date (date picker, required) — **validated**: Due Date must be ≥ Start Date; inline error shown if violated
- Customer (text, required)
- PO# (text, optional)
- Qty (ea) (integer, required)
- Pvg" / Dowel Size / O.C. (text, optional, shown in a 3-column row)
- Coating (dropdown, required) — if "Other" selected, a free-text field appears beneath
  - **Bug fix applied**: on edit, `coating_other` is explicitly re-populated from the DB value to avoid the blank field bug
- # of Dowels / # Total LF (integer, optional)
- Status (segmented button group) — defaults to "In Production" on new orders
  - **Cancelled warning**: selecting Cancelled shows "⚠️ Cancelled orders will be automatically archived."
- CPU ASAP (toggle switch) — amber when enabled

### Status Logic
| Status | Badge Color |
|---|---|
| In Production | `#38BDF8` (blue) |
| Ready to Ship | `#00E676` (green) |
| Delayed | `#FF8C00` (orange) |
| On Hold | `#FFD700` (yellow) |
| Cancelled | `#FF1744` (red) |

### Auto-Archive on Cancel
When a user saves an order with status = Cancelled, the save payload sets `archived: true` simultaneously. Cancelled orders never appear in the active tab view.

### Activity Log
- Stored in `production_order_activity` table
- Written on: order created, any field changed (with old → new values), status change, CPU ASAP toggle, manual archive
- Expandable inline below each table row (▼/▲ toggle)
- Shows timestamp + human-readable action string

### Archive View
- Toggled by the "🗄 Archived" header button
- Sub-tabs: All | Baskets | Loose Dowels | EpoxyFab
- Read-only table (no edit button)
- **Restore** button per row — unarchives and returns order to active view
- Cancelled orders appear here automatically

### CSV Export
Exports currently visible tab's active (non-archived) orders. Columns match table order exactly:
Start Date, Due Date, Customer, PO#, Qty, Pvg", Dowel Size, O.C., Coating, # of Dowels, # Total LF, Status, CPU ASAP, Order Type

### Realtime
`useOrders.js` subscribes to `postgres_changes` on `production_orders`. INSERTs, UPDATEs (including archive), and DELETEs are reflected immediately without a page refresh. A brief flash animation highlights newly changed rows.

---

## Design

| Token | Value |
|---|---|
| Background | `#1a1a1a` |
| Surface / tiles | `#1E293B` |
| Table header bg | `#363636` |
| Primary green | `#96ba94` (updated from original `#4a7c3f`) |
| CPU ASAP amber | `#FF8C00` |
| Text primary | `#CBD5E1` |
| Text secondary | `#a0a0a0` |
| Border | `#333333` |
| Row hover | `#2e2e2e` |
| Fonts | Oswald (headings) / IBM Plex Sans (body) |

All green accents (header brand icon, tab underline active, badge counts, tile numbers, Add Order button, form highlights, toggle active state) use `var(--accent-green)` from `globals.css`. To change the green, edit that one variable.

---

## Current State

### What's Working
- Full project builds cleanly (`npm run build` — zero errors, zero warnings beyond the expected Supabase credential warning)
- Dev server runs on port 3001 (`npm run dev`)
- All UI components render correctly
- Tab navigation, count badges, summary tiles all correct
- Add Order form: all fields, validation, Cancelled warning, coating_other repopulation
- Edit Order form: all fields pre-populated correctly from DB record
- CPU ASAP toggle and amber row highlighting
- Status badges with correct colors
- Archive/unarchive flow
- CSV export
- Activity log UI (expandable inline rows)
- Realtime subscription wired up

### What Requires Supabase to Test
The following are coded and wired but require live Supabase credentials + schema to exercise end-to-end:
- Actual data persistence (create/update orders)
- Realtime push (multi-tab sync)
- Activity log entries writing to `production_order_activity`
- Archive persistence
- All Supabase RLS policies (none configured yet — **RLS is off by default**)

### Known Gaps / Not Built
- **RLS policies** — Supabase Row Level Security is not configured. Anyone with the anon key can read/write all orders. For an internal tool this may be acceptable, but should be reviewed.
- **Vercel deployment** — not yet deployed. No `vercel.json`, no environment variables set in Vercel dashboard.
- **Pagination** — the table renders all active orders for a tab with no pagination. Fine for current volume; add if order counts grow large.
- **Search/filter bar** — the shipment tracker has one; the production planner does not. Not in the spec but may be requested.
- **Warehouse route** — Phase 2 only. Not started.
- **Delete (hard)** — there is no permanent delete. Archive is the only removal path. Intentional per spec.
- `--accent-green-hover: #5a9a4a` in `globals.css` is a leftover variable that is not currently used anywhere in the codebase.

---

## Next Steps (Exact)

1. **Create Supabase project** (if not already done):
   - Run the SQL schema above in the Supabase SQL editor
   - Copy the project URL and anon key into `production-planner/.env.local`
   - Test locally with `npm run dev` (port 3001)

2. **Configure RLS** (recommended before any shared use):
   - Enable RLS on `production_orders` and `production_order_activity`
   - Add a policy: `USING (true)` for internal anon-key access, or add auth if needed

3. **Deploy to Vercel**:
   - Connect the `FrankTortilla/Kanexa` repo to a new Vercel project
   - Set root directory to `production-planner/`
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard
   - Deploy

4. **End-to-end smoke test** after connecting Supabase:
   - Add an order in each tab (Baskets, Loose Dowels, EpoxyFab)
   - Verify Total Qty and Total LF tiles update
   - Toggle CPU ASAP — verify row pins to top with amber highlight
   - Set status to Cancelled — verify it disappears from active view and appears in Archive
   - Manually archive an order — verify Restore works
   - Export CSV — verify column order matches spec
   - Open activity log on an edited order — verify change entries appear

5. **Phase 2 — Warehouse route**: add `/warehouse` as a read-only view showing only "In Production" and "Ready to Ship" orders, likely large-format like the shipment tracker warehouse view.

---

## Running Locally

```bash
cd production-planner
npm install
# create .env.local with Supabase credentials
npm run dev   # → http://localhost:3001
```

Dev server config is in `.claude/launch.json` at the worktree root (alongside the shipment-tracker config).
