# Green Steel Production Planner

Office-facing production order management app for Green Steel. Sister app to the Green Steel Shipment Tracker.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS v4 + inline styles

## Supabase Setup

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

Supabase project URL: _[add your project URL here]_

## Database Schema

### `production_orders`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| order_type | order_type ENUM | Baskets, Loose Dowels, EpoxyFab |
| start_date | DATE | |
| due_date | DATE | |
| customer | TEXT | |
| po_number | TEXT | optional |
| quantity | INTEGER | |
| pvg | TEXT | optional |
| dowel_size | TEXT | optional |
| oc | TEXT | optional |
| coating | coating_type ENUM | Plain, Epoxy, Epoxy/Tectyl, Epoxy/Patch, Painted, Other |
| coating_other | TEXT | populated when coating = 'Other' |
| num_dowels | INTEGER | optional |
| total_lf | INTEGER | optional |
| status | order_status ENUM | In Production, Ready to Ship, Delayed, On Hold, Cancelled |
| cpu_asap | BOOLEAN | pins order to top with amber highlight |
| archived | BOOLEAN | soft-archive flag |
| created_at | TIMESTAMPTZ | |

### `production_order_activity`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK → production_orders(id) ON DELETE CASCADE | |
| action | TEXT | human-readable log entry |
| created_at | TIMESTAMPTZ | |

## Routes

- `/` — Office admin view (all tabs, add/edit, archive toggle)

Phase 2 will add a warehouse route.

## Key Design Decisions

- **Status as single enum**: one status per order, rendered as a color-coded badge.
- **CPU ASAP flag**: `cpu_asap = true` pins the order to the very top of its tab, highlighted with amber (#FF8C00) left border and row tint.
- **Auto-archive on cancel**: when status is set to Cancelled, `archived = true` is written at the same time. Cancelled orders never appear in the active tab.
- **Running totals exclude cancelled and archived**: DashboardSummary tiles sum `quantity` and `total_lf` only for orders where `status != 'Cancelled'` and `archived = false`.
- **Coating "Other" edge case**: `coating_other` is explicitly re-populated from DB on every edit to avoid a blank field bug.
- **Activity log**: every field change, status change, and CPU ASAP toggle is written to `production_order_activity` with a human-readable description.
- **Default sort**: Due Date ascending (most urgent first), with CPU ASAP rows always pinned above.

## Color Scheme

- Background: `#1a1a1a`
- Primary green: `#4a7c3f`
- CPU ASAP amber: `#FF8C00`
- Status badges:
  - In Production: `#38BDF8` (blue)
  - Ready to Ship: `#00E676` (green)
  - Delayed: `#FF8C00` (orange)
  - On Hold: `#FFD700` (yellow)
  - Cancelled: `#FF1744` (red)
