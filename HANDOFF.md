# Handoff — Green Steel Shipment Tracker
_Last updated: 2026-05-05 (Session 5)_

## Project Safety Rule
Before making edits, migrations, commits, or deployments, every AI tool must verify it is working in the correct existing project. Do not create a new project, app folder, repo, worktree, or branch unless the user explicitly asks.

For this project, the active app folder is:

```text
/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/.claude/worktrees/sleepy-ramanujan-27251b/shipment-tracker
```

Required preflight before editing:
1. Confirm the current folder matches the active app folder above.
2. Confirm the app structure exists: `package.json`, `src/app`, `src/components`, and `supabase/migrations`.
3. Check `git status --short --branch` and the latest commit.
4. Read this `HANDOFF.md`.
5. If the folder, branch, latest commit, or handoff context does not match, stop and ask the user before continuing.

Required preflight before deployment:
1. Run lint and a production build.
2. Check whether Supabase migrations are required.
3. Confirm the Vercel project link before deploying.
4. If migrations are required, apply or confirm the database changes before deploying code that depends on them.
5. Verify the live site after deploy, especially the specific feature that changed.

Use this same safety rule as the template for other projects: each project should list its own active app folder, branch/context, migration system, and deploy target in its `HANDOFF.md` or project intelligence file.

## 🔄 Current Task
Session 5 app regression fixes are complete and live in production. Supabase migration blocker is resolved in production. Dashboard/cancelled/totals fixes and price/special-instructions preservation fixes were pushed and deployed to production.

## ✅ What Was Just Completed
**Session 5 (2026-05-05)** focused on Supabase migration safety and recovery protocol:

1. **Confirmed Supabase project** — production database is `FrankTortilla's Project` / `ntfblbamjejyctcgtmls`, shared by Waypoint (`shipments`, `shipment_materials`, `shipment_notes`) and Production Planner (`production_orders`, `production_order_activity`).
2. **Applied Waypoint archive/cancel migrations** — production Supabase now has `stage`, `pre_archive_stage`, `pre_archive_status`, `archive_shipment(p_id uuid)`, and `unarchive_shipment(p_id uuid)`.
3. **Allowed `Cancelled` status** — added migration `20260505000004_allow_cancelled_status.sql` and applied it in production so `shipments_status_check` now allows `Pending`, `Booked`, `In Transit`, `Delivered`, and `Cancelled`.
4. **Hardened archive RPCs** — added/applied `20260505000005_harden_archive_rpc_functions.sql`; archive/unarchive RPCs are now `SECURITY INVOKER` with `search_path=public`, and `update_updated_at()` has a fixed search path.
5. **Rollback-safe RPC smoke test** — ran archive/unarchive inside a transaction followed by `ROLLBACK`; no test changes persisted.
6. **Recovery protocol added** — see `shipment-tracker/docs/RECOVERY_PROTOCOL.md`.
7. **Manual backup script added** — see `shipment-tracker/scripts/supabase-backup.sh`; requires `SUPABASE_DB_URL` and writes gitignored exports under `backups/`.
8. **Gitignore updated** — `supabase/.temp/` and `backups/` are ignored.
9. **Dashboard/cancelled regression fixed** — Total Weight/Price now follow the selected dashboard card/tab and active search; the Cancelled card count now matches the visible Cancelled filtered page immediately.
10. **Lint cleanup** — fixed the `LiveIndicator.jsx` React lint error and replaced the remaining plain logo `<img>` tags with Next `<Image>`.
11. **Verification** — `npm run lint` passes cleanly. `npm run build` passes; local build prints the expected missing `.env.local` Supabase warning because local env vars are not present in this worktree.
12. **Production deployment** — pushed branch `claude/sleepy-ramanujan-27251b` and deployed with Vercel CLI. Production alias is live at `https://shipment-tracker-one.vercel.app`; deployment id `dpl_7YwSccmbUrXmaDXGEpNbH4287vEA`; deployment URL `https://shipment-tracker-er66xwknf-steve-6797s-projects.vercel.app`.
13. **Price/special-instructions preservation fix** — status-only changes now explicitly preserve `price` and `special_instructions`, and un-cancelling routes a load back to the stage matching the chosen status instead of always forcing `pending`.
14. **History special instructions column** — History now displays Special Instructions so archived loads visibly keep that field.
15. **Stage correction migration** — added/applied `20260505000006_sync_active_stage_to_status.sql` so active non-cancelled shipments have `stage` aligned with `status`; Cancelled rows keep their prior-stage value.
16. **Verification** — `npm run lint` passes, `npm run build` passes, and a rollback-safe Supabase smoke test confirmed archive/unarchive preserves `price` and `special_instructions`.
17. **Production deployment for preservation fix** — pushed branch `claude/sleepy-ramanujan-27251b` and deployed with Vercel CLI. Production alias is live at `https://shipment-tracker-one.vercel.app`; deployment id `dpl_CgfBTmuJa9yKvbqKEqvzD2kTgHtf`; deployment URL `https://shipment-tracker-nu0nelg0g-steve-6797s-projects.vercel.app`; commit `6ee2a2be`.

Remaining Supabase advisor notes after hardening:
- Production Planner tables `production_orders` and `production_order_activity` have RLS disabled.
- Waypoint tables still use intentionally open RLS policies (`Allow all access`), matching the current no-auth app design.
- Some foreign keys are unindexed; performance improvement, not an active blocker.

---

**Session 4 (2026-05-05)** focused on Cancelled stat card, un-cancel routing, archive/unarchive state restoration, and a race condition fix in `useShipments`:

1. **Cancelled stat card** — `DashboardSummary.jsx` now renders a Cancelled tile (count + routing). Clicking it navigates to the filtered Cancelled view.
2. **Stat card click routing** — All stat cards now correctly route to the filtered shipment view when clicked (Active, Pending, Booked, In Transit, Delivered, Cancelled, Archived).
3. **Un-cancel flow** — Shipments in `Cancelled` status can be restored to their prior stage. `ShipmentTable.jsx` exposes an "Un-cancel" action that calls `useShipments` to revert status.
4. **Archive/unarchive with state restoration** — Added `pre_archive_status` and `stage` columns to `shipments`. Archiving saves current status/stage; unarchiving restores them exactly. Archive and unarchive actions wired in `ShipmentTable.jsx`.
5. **Race condition fix (dirty flag)** — `useShipments.js` now tracks a `dirty` flag. Realtime Supabase updates that arrive while a local mutation is in-flight are suppressed until the mutation settles, preventing stale overwrites.
6. **Supabase migrations** — Three new migration files:
   - `20260505000001_add_stage_and_pre_archive_columns.sql` — adds `stage`, `pre_archive_status`, `pre_archive_stage` to `shipments`
   - `20260505000002_backfill_stage_and_pre_archive.sql` — backfills existing rows
   - `20260505000003_create_archive_unarchive_rpcs.sql` — `archive_shipment()` and `unarchive_shipment()` Postgres RPCs
7. **Archive-delivered cron updated** — `src/app/api/cron/archive-delivered/route.js` updated to write `pre_archive_status`/`stage` before setting `archived_at`.

---

**Session 3 (2026-05-04)** wrapped up a batch of UI/UX polish across both the Shipment Tracker and the new Production Planner app:

1. **Cancelled status** — Added `Cancelled` as a full first-class status in `constants.js` (`STATUS`, `STATUSES`, `STATUS_LIST`, `STATUS_COLORS`, `BADGE_COLORS`) with color `#FF1744` (`accent-danger`). `ShipmentTable.jsx` inline status dropdown now renders it.
2. **History tab: spend/weight summary cards** — `ShipmentHistory.jsx` now shows Total Weight and Total Price summary cards that react to active filters and accordion expansion state. Cards are ordered weight-left / price-right. `DashboardSummary.jsx` metric card order was also swapped to match.
3. **History tab: accordion-reactive summary cards** — Summary cards update as the user opens/collapses week-group accordions (not just filter changes).
4. **SureBuilT logo in Header** — Replaced the old `[GS]` SVG icon + text block with `green_steel_LOGO_copy.png` at 44px height. Header is now two-row: logo + action buttons (row 1), Active/Delivered/History tabs (row 2). Mobile breakpoint at 640px collapses buttons to icon-only. Tab row is horizontally scrollable.
5. **Production Planner bootstrapped** — New Next.js app at `production-planner/` spun up: Vercel link, env vars, feature flag scaffolding. Styled to match Waypoint/Shipment Tracker design system (SureBuilT logo, dark theme, Oswald font, filled/outlined status pills).
6. **Date picker calendar icon fix** (Production Planner) — Added `-webkit-calendar-picker-indicator` invert filter to `production-planner/src/app/globals.css` so the calendar icon is visible on dark backgrounds.

## 🔜 Next Steps (in order)
1. **Manual live Waypoint verification** — on `https://shipment-tracker-one.vercel.app`, move a real load to Cancelled and then back to its intended status; confirm rate/price remains and the load returns to the correct card/tab. Archive a delivered load and confirm Special Instructions are visible in History.
2. **Decide Production Planner RLS/security model** — Supabase advisors flag `production_orders` and `production_order_activity` because RLS is disabled.
3. **Production Planner feature build-out** — the app is bootstrapped but currently only has scaffolding. `OrderForm.jsx`, `OrderTable.jsx`, `DashboardSummary.jsx`, `ActivityLog.jsx`, `ArchivedOrders.jsx`, and `StatusBadge.jsx` exist but need real business logic and Supabase integration.
4. **History tab search** — `<SearchFilterBar>` is hidden when `activeTab === 'history'` (see `page.js`). Either show the bar on History or move search logic inside `ShipmentHistory.jsx`.
5. **`newShipmentAlert` not wired up** — `useShipments.js` returns `newShipmentAlert: { id, customer_name }` (clears after 4s) but `page.js` never renders it. A toast/banner for incoming real-time shipments would be quick to add.
6. **Mobile responsiveness** — `ShipmentTable.jsx` uses a fixed-column HTML table with no responsive breakpoints. Card-based layout for small screens would be a significant rewrite.

## 🧠 Key Decisions Made
- **`Cancelled` uses `accent-danger` (`#FF1744`)** — matches conventional red-for-cancel UI language; glow is `rgba(255, 23, 68, 0.15)` to stay subtle.
- **Two-row header layout** — separates primary actions (add, export, print) from navigation tabs; improves scannability and mobile collapse behavior.
- **Production Planner as a separate Next.js app** (`production-planner/`) rather than a route inside `shipment-tracker/` — keeps the two domains fully independent with their own Vercel deployments and Supabase schemas. This was scaffolded but left for the next session to build out.
- **Summary cards react to accordion state** — decided to count only shipments in *expanded* week groups, so the summary reflects what the user is currently looking at rather than all filtered results.

## 🐛 Known Bugs / Blockers
- **No current deploy blocker found** — lint and production build pass locally.
- **Supabase security advisors remain** — Production Planner RLS is disabled; Waypoint has intentionally open policies because auth is currently removed.
- Production Planner is scaffold-only — not functional yet.
- `newShipmentAlert` is computed but never displayed (low priority).

## 🗂 Architecture Notes
### Multi-app monorepo structure
```
Green Steel Shipment Tracker/          ← git worktree root
├── shipment-tracker/                  ← standalone Next.js app (Vercel: prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv)
│   ├── src/app/page.js                ← office view (Active / Delivered / History tabs)
│   ├── src/app/warehouse/page.js      ← warehouse read-only view
│   ├── src/components/                ← 16 components (see below)
│   ├── src/hooks/useShipments.js      ← all Supabase CRUD + realtime
│   └── src/lib/constants.js           ← STATUS, STATUSES, STATUS_COLORS, BADGE_COLORS
├── production-planner/                ← NEW standalone Next.js app (bootstrapped this session)
│   ├── src/app/page.js
│   ├── src/components/                ← 8 components (scaffold)
│   └── src/app/globals.css
└── .claude/commands/                  ← NEW — created this session (empty, ready for custom slash commands)
```

### Shipment Tracker components
| File | Purpose |
|---|---|
| `Header.jsx` | Two-row nav: SureBuilT logo + actions (row 1), tabs (row 2) |
| `DashboardSummary.jsx` | Stat tiles — Total, Pending, Booked, In Transit, Delivered, Cancelled |
| `ShipmentTable.jsx` | Main table — sortable, inline status dropdown (portal), POD cell, row expand |
| `ShipmentHistory.jsx` | History tab — Mon–Fri week grouping, collapsible, date range, spend/weight summary cards |
| `ShipmentForm.jsx` | Add/Edit modal — all fields, materials list, duplicate PO check |
| `SearchFilterBar.jsx` | Search input + result count |
| `Pagination.jsx` | Page nav + rows-per-page selector |
| `ActivityLog.jsx` | Per-shipment event log (inside expanded row) |
| `PODCell.jsx` | Upload / view Proof of Delivery |
| `UrgencyBadge.jsx` | Color-coded urgency by ship date proximity |
| `StatusBadge.jsx` | Pill badge using `STATUS_COLORS` from constants |
| `StatusStepper.jsx` | Visual status progress bar |
| `LiveIndicator.jsx` | Realtime connection dot |
| `EmptyState.jsx` | Zero-results placeholder |
| `PrintView.jsx` | Print-only layout |
| `ExportCSV.jsx` | `exportToCSV(shipments)` utility |

### CSS design tokens (globals.css)
| Variable | Value |
|---|---|
| `--accent-green` | `#96ba94` (sage) |
| `--accent-pending` | `#FF8C00` |
| `--accent-booked` | `#3b82f6` |
| `--accent-in-transit` | `#a524e8` (purple) |
| `--accent-delivered` | `#22c55e` |
| `--accent-danger` | `#FF1744` (Cancelled) |
| `--bg-primary` | `#1a1a1a` |
| `--bg-hover` | `#2e2e2e` |

### Supabase tables
| Table | Key Columns |
|---|---|
| `shipments` | `id`, `customer_name`, `po_number`, `status`, `stage`, `ship_date`, `delivery_date`, `carrier_name`, `tracking_number`, `city`, `state`, `material`, `trailer_type`, `loading_building`, `special_instructions`, `pod_file_path`, `deleted_at`, `archived_at`, `pre_archive_status`, `pre_archive_stage` |
| `shipment_materials` | `id`, `shipment_id`, `material_name`, `quantity` |
| `shipment_notes` | `id`, `shipment_id`, `note`, `created_at`, `author` |

Soft-delete: `deleted_at`. Archive: `archived_at` (saves state to `pre_archive_status`/`pre_archive_stage`). Unarchive restores from those columns. Permanent delete (History only): Storage → notes → materials → row.

**Supabase RPCs (added Session 4):**
- `archive_shipment(shipment_id)` — sets `archived_at`, saves current status/stage to `pre_archive_*`
- `unarchive_shipment(shipment_id)` — clears `archived_at`, restores `status`/`stage` from `pre_archive_*`

✅ **Migrations applied in production** — Session 5 migrations through `20260505000006_sync_active_stage_to_status.sql` have been applied to Supabase project `ntfblbamjejyctcgtmls`. Future sessions should still check for new pending migrations before deploy.

## 📋 Changelog
- [2026-05-01 ~14:00] Session 2: HANDOFF.md created; standalone git repo initialized in shipment-tracker/ (initial commit 9684fe1); not yet pushed to GitHub
- [2026-05-03 22:00] Session 3a: SureBuilT logo swapped into Header (two-row layout, mobile icon-only); Production Planner bootstrapped and styled to match Waypoint design system; date picker calendar icon fixed in production-planner globals.css
- [2026-05-04 11:52] Session 3b: History tab spend/weight summary cards restored, reactive to filters; metric card order swapped (weight left, price right)
- [2026-05-04 12:16] Session 3c: History tab summary cards now react to accordion expansion state (count only expanded week groups)
- [2026-05-04 15:08] Session 3d: Cancelled status added as first-class status (#FF1744 / accent-danger) in constants.js and ShipmentTable.jsx dropdown
- [2026-05-04 15:30] Session 3 handoff: HANDOFF.md rewritten to reflect full current state; .claude/commands/ directory created
- [2026-05-05] Session 4: Cancelled stat card + routing; un-cancel flow; archive/unarchive with pre-archive state restoration (pre_archive_status/stage columns + RPCs); race condition fix (dirty flag in useShipments); 3 Supabase migrations added; archive-delivered cron updated; deployed to https://shipment-tracker-one.vercel.app (commit ad23d889)
- [2026-05-05] Session 5: Applied Supabase migrations/recovery protocol; fixed dashboard totals and Cancelled count/page agreement; fixed rate/price and special-instructions preservation across Cancelled/archive flows; deployed to https://shipment-tracker-one.vercel.app (commit 6ee2a2be, deployment dpl_CgfBTmuJa9yKvbqKEqvzD2kTgHtf)
