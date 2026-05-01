# Green Steel Shipment Tracker — Handoff Document

**Last updated:** 2026-05-01  
**Project root (worktree):** `/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/.claude/worktrees/modest-haslett-bb913e/`  
**App directory:** `shipment-tracker/`

---

## Project Name & Purpose

**Green Steel Shipment Tracker** — an internal operations tool for Green Steel Manufacturing. It lets office staff create, track, and manage steel shipments from Pending through Delivered, and lets warehouse staff view and update shipments. Features include real-time updates (Supabase Realtime), POD (Proof of Delivery) document uploads, activity logs, weekly history grouping, and CSV export.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, `'use client'` everywhere) |
| Runtime | Node.js / React 18 |
| Bundler | Turbopack (configured in `next.config.mjs`) |
| Database | Supabase (Postgres) |
| Realtime | Supabase Realtime (postgres_changes subscription) |
| Storage | Supabase Storage — bucket `pod-documents` |
| Auth | **None** — auth was added and then fully removed |
| Styling | Inline styles + CSS custom properties in `globals.css` |
| Deployment | Vercel — Project ID `prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv` |
| Package manager | npm |

---

## Environment Variables

Required in `.env.local` (never committed):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

These must also be set in Vercel project settings (Settings → Environment Variables).

---

## Key File Paths

### App / Pages
| File | Purpose |
|---|---|
| `shipment-tracker/src/app/page.js` | Main office view — Active, Delivered, History tabs |
| `shipment-tracker/src/app/warehouse/page.js` | Warehouse-only view (read + status update, no add/edit/delete) |
| `shipment-tracker/src/app/globals.css` | All CSS custom properties (colors, typography, spacing) |
| `shipment-tracker/src/app/layout.js` | Root layout, font loading |

### Components
| File | Purpose |
|---|---|
| `src/components/Header.jsx` | Top nav bar — tabs (Active/Delivered/History), Export CSV, Print, + Add Shipment |
| `src/components/DashboardSummary.jsx` | Stat tiles row — Total, Pending, Booked, In Transit, Delivered |
| `src/components/ShipmentTable.jsx` | Main data table — sortable columns, inline status dropdown (portal), POD cell, row expand |
| `src/components/ShipmentHistory.jsx` | History tab — Mon–Fri week grouping, collapsible sections, date range filter, week selector, sort by ship/delivery date |
| `src/components/ShipmentForm.jsx` | Add/Edit shipment modal — all fields, materials list, duplicate PO check |
| `src/components/SearchFilterBar.jsx` | Search input + result count |
| `src/components/Pagination.jsx` | Page navigation + rows-per-page selector |
| `src/components/ActivityLog.jsx` | Per-shipment event log (rendered inside expanded row) |
| `src/components/PODCell.jsx` | Upload / view Proof of Delivery files |
| `src/components/UrgencyBadge.jsx` | Color-coded urgency indicator based on ship date proximity |
| `src/components/EmptyState.jsx` | Zero-results placeholder |
| `src/components/PrintView.jsx` | Print-only layout (hidden on screen, shown on `window.print()`) |
| `src/components/ExportCSV.jsx` | CSV export utility — `exportToCSV(shipments)` |

### Hooks & Lib
| File | Purpose |
|---|---|
| `src/hooks/useShipments.js` | All Supabase CRUD, realtime subscription, archive/unarchive, permanent delete, POD path update |
| `src/lib/supabase.js` | Supabase client singleton (`createClient`) |
| `src/lib/constants.js` | `DEFAULT_ROWS_PER_PAGE`, `BADGE_COLORS` map |

### Config
| File | Purpose |
|---|---|
| `next.config.mjs` | Turbopack `root` set to `__dirname` (required for git worktree builds) |
| `.vercel/project.json` | Vercel project linkage — `projectId: prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv` |
| `public/logo-icon.png` | App logo shown in Header (GSI bracket mark) |

---

## Database Tables (Supabase)

| Table | Key Columns |
|---|---|
| `shipments` | `id`, `customer_name`, `po_number`, `status`, `ship_date`, `delivery_date`, `carrier_name`, `tracking_number`, `city`, `state`, `material`, `trailer_type`, `loading_building`, `special_instructions`, `pod_file_path`, `deleted_at`, `archived_at` |
| `shipment_materials` | `id`, `shipment_id`, `material_name`, `quantity` |
| `shipment_notes` | `id`, `shipment_id`, `note`, `created_at`, `author` |

**Soft-delete pattern:** `deleted_at` column (set to timestamp, never hard-deleted from active flow).  
**Archive pattern:** `archived_at` column — archived rows are excluded from Active/Delivered views, visible only in History.  
**Permanent delete** (History tab only): deletes Storage file → notes → materials → shipment row in order.

---

## What Was Built & Changed This Session

### 1. Status Dropdown Scrollbar Fix (`ShipmentTable.jsx`)
- Problem: dropdown was clipped by `overflow: auto` on the table container.
- Fix: rewrote `StatusDropdown` to use `createPortal(dropdownContent, document.body)` with `position: fixed` coordinates captured via `getBoundingClientRect()`. Scroll listener closes the dropdown to prevent stale positions.

### 2. History Tab Full Rebuild (`ShipmentHistory.jsx`)
- Replaced the old flat list with Mon–Fri work-week grouping.
- `getWeekKey(dateStr)` → returns the Monday of that date as ISO string.
- `formatWeekLabel(mondayStr)` → e.g. "Apr 28 – May 2" or "Dec 30, 2025 – Jan 3, 2026".
- Week selector dropdown filters to one specific week.
- Date range filter (From / To) narrows the dated shipments pool.
- Undated shipments (null ship_date) always appear in their own "Undated / TBD" group.
- Sort by Ship Date or Delivery Date (ascending/descending) via clickable column headers.
- CSV export respects all active filters.
- **All weeks start collapsed** — no auto-expand on load.
- Week group header bars styled as cards: `rgba(255,255,255,0.04)` background, `0.5px solid rgba(255,255,255,0.08)` border, `8px` radius.

### 3. Color Scheme Updates (`globals.css`)
| Variable | Old Value | New Value |
|---|---|---|
| `--accent-green` | `#00E676` | `#96ba94` (sage green) |
| `--accent-green-hover` | `#00E676` | `#96ba94` |
| `--accent-in-transit` | `#38BDF8` (blue) | `#a524e8` (purple) |
| `--accent-delivered` | `#4a7c3f` | `#22c55e` (bright green) |
| `--accent-delivered-glow` | — | `rgba(34, 197, 94, 0.25)` |
| `--accent-in-transit-glow` | — | `rgba(165, 36, 232, 0.25)` |
| `--bg-hover` | `#1E2A38` | `#222222` |

### 4. Logo Swap (`public/logo-icon.png`)
- Replaced old SVG/PNG with `GS_Shipment_LOGO.png` (GSI bracket mark).
- `Header.jsx` `src` updated from `/logo-icon.svg` → `/logo-icon.png`.

### 5. Delivered Stat Tile Color (`warehouse/page.js`)
- `SummaryCard` for Delivered hardcoded color changed from `#4a7c3f` → `#22c55e` to match the Delivered badge.

### 6. Materials Race Condition Fix (`useShipments.js → updateShipment`)
- Problem: Supabase Realtime fired a fetch between the materials `DELETE` and `INSERT`, returning an empty array and wiping materials in local state.
- Fix: after the materials `INSERT` completes, call `setShipments` a second time with the authoritative `savedMaterials` array. Local state always wins the race.

### 7. Auth Added Then Removed
- Supabase email/password auth was added to `page.js` and `Header.jsx`, deployed once, then fully removed at user request.
- `page.js` is now clean — no `useEffect`, no session state, no auth imports.
- `Header.jsx` is clean — no logout button.

### 8. Turbopack Worktree Fix (`next.config.mjs`)
- Added `turbopack: { root: __dirname }` to resolve Turbopack's inability to find `next/package.json` from inside the git worktree path.

---

## Current State of the App

### Working
- Active tab: create, edit, delete, archive shipments; inline status change; row expand with activity log; POD upload/view; search; sort; pagination.
- Delivered tab: same as Active + "Archive All Delivered" batch action.
- History tab: week grouping, collapsible sections, date range filter, week selector, sort by ship/delivery date, CSV export, unarchive, permanent delete. All weeks start collapsed.
- Dashboard stat tiles: click to filter by status.
- Real-time sync across browser tabs via Supabase Realtime.
- Print view and CSV export.
- Warehouse view at `/warehouse` — read-only with status updates.

### Not Working / Known Limitations
- No authentication — the app is publicly accessible to anyone with the URL. **This is intentional per user request** (auth was removed). If access control is needed, it must be re-added.
- No role-based permissions beyond the separate `/warehouse` route.
- POD storage bucket (`pod-documents`) must exist in Supabase Storage and be configured with appropriate policies.

### Known Bugs
- None confirmed as of last deploy. The materials race condition, status dropdown clip, and history collapse bugs are all resolved.

---

## Deployment

**Vercel project:** `prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv`  
**Deploy command (from worktree app dir):**
```bash
cd /Users/stephengutierrez/Desktop/Green\ Steel\ Shipment\ Tracker/.claude/worktrees/modest-haslett-bb913e/shipment-tracker
vercel --prod
```

The `.vercel/project.json` file in the app directory links to the correct Vercel project.

---

## How to Run Locally

```bash
cd /Users/stephengutierrez/Desktop/Green\ Steel\ Shipment\ Tracker/.claude/worktrees/modest-haslett-bb913e/shipment-tracker
npm install          # only needed once
npm run dev          # starts on http://localhost:3000
```

Create `.env.local` in the `shipment-tracker/` directory with the two Supabase env vars listed above.

---

## Exact Next Steps

### Immediate (unfinished from this session)

1. **Push to GitHub** — the standalone repo in `shipment-tracker/` has been initialized and committed but not yet pushed. Run one of:

   **Option A — GitHub CLI (one command):**
   ```bash
   cd "/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/.claude/worktrees/modest-haslett-bb913e/shipment-tracker"
   gh repo create green-steel-shipment-tracker --private --source=. --remote=origin --push
   ```

   **Option B — Manual:**
   ```bash
   cd "/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/.claude/worktrees/modest-haslett-bb913e/shipment-tracker"
   git remote add origin git@github.com:YOUR_USERNAME/green-steel-shipment-tracker.git
   git branch -M main
   git push -u origin main
   ```
   Create the repo first at github.com/new (Private, no README).

   After pushing, update this file with the GitHub repo URL.

### Feature / Improvement Backlog

2. **Re-add authentication** — if access control becomes needed again, use Supabase Auth with `@supabase/ssr` and Next.js middleware (`middleware.js`) rather than client-side guards. The previous implementation used `supabase.auth.signInWithPassword()` directly in `src/app/page.js` — that approach was removed. A middleware-based approach would be cleaner and more secure.

3. **History tab search** — `searchQuery` is passed as a prop to `ShipmentHistory.jsx` but the `<SearchFilterBar>` is hidden when `activeTab === 'history'` (see `src/app/page.js` line 233: `activeTab !== 'history'`). Either show the bar on the History tab or move search logic inside `ShipmentHistory.jsx` itself.

4. **`newShipmentAlert` not wired up** — `useShipments.js` returns `newShipmentAlert: { id, customer_name }` (set on Realtime INSERT, clears after 4s) but `src/app/page.js` never destructures or renders it. A toast or banner notification for incoming shipments would be straightforward to add.

5. **Warehouse view improvements** — `src/app/warehouse/page.js` is a thin read-only view. Could add: search bar, date filtering, POD file viewing (currently only upload is available from office view), or activity log expansion.

6. **Mobile responsiveness** — `ShipmentTable.jsx` uses a fixed-column HTML table with no responsive breakpoints. A card-based layout for small screens would require a significant rewrite of `ShipmentTable.jsx` and `ShipmentHistory.jsx`.

---

## Git Context

### Claude Worktree (internal)
- **Worktree branch:** `modest-haslett-bb913e` (inside `.claude/worktrees/`)
- **Main repo:** `/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/`
- Recent worktree commits (most recent first):
  - `72ff7b67` — card styling on week group header bars
  - `578291b3` — all History weeks start collapsed
  - Auth add/remove commits
  - Color scheme + logo commits
  - History tab rebuild
  - Status dropdown portal fix

### Standalone Git Repo (GitHub)
- **Location:** `shipment-tracker/` directory has its own independent `.git/`
- **Initial commit:** `9684fe1` — "Initial commit — Green Steel Shipment Tracker" (48 files)
- **Branch:** `main`
- **Remote:** not yet pushed — see "Exact Next Steps" for push commands
- **`.gitignore`** already existed (Next.js generated) — covers `.env*`, `node_modules/`, `.next/`, `.vercel/`, `*.tsbuildinfo`

---

## Session 2 Changes (2026-05-01)

### 1. HANDOFF.md Created
- File written to worktree root: `HANDOFF.md` (this file)
- Covers full project context, all file paths, session changes, known bugs, env vars, and next steps

### 2. Git Repository Initialized (`shipment-tracker/`)
- Ran `git init` inside `shipment-tracker/` to create a standalone repo independent of the Claude worktree
- Verified `.gitignore` (Next.js-generated) already correctly excludes `.env*`, `node_modules/`, `.next/`, `.vercel/`
- Staged all 48 project files and created initial commit `9684fe1`
- Repo is on branch `main`, no remote set yet
- **Not yet pushed to GitHub** — push commands provided to user (see below)
