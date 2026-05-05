-- Migration: Backfill stage and pre_archive fields for existing rows

-- 1. Set stage = 'archived' for rows that are already archived
UPDATE shipments
SET stage = 'archived'
WHERE archived_at IS NOT NULL
  AND stage = 'pending';  -- only touch rows that haven't been set yet

-- 2. Set stage for active (non-archived) rows based on their current status.
--    Cancelled shipments remain in 'pending' stage (they were not routed to a new tab).
UPDATE shipments
SET stage = CASE
  WHEN status = 'Pending'    THEN 'pending'
  WHEN status = 'Booked'     THEN 'booked'
  WHEN status = 'In Transit' THEN 'in-transit'
  WHEN status = 'Delivered'  THEN 'delivered'
  ELSE 'pending'   -- Cancelled and any unknown statuses default to pending tab
END
WHERE archived_at IS NULL;

-- 3. Backfill pre_archive fields for archived rows that have no snapshot yet.
--    These rows were archived before this feature existed; we default to 'Pending'
--    as the safest restore target (spec requirement).
UPDATE shipments
SET
  pre_archive_stage  = 'pending',
  pre_archive_status = 'Pending'
WHERE archived_at IS NOT NULL
  AND (pre_archive_stage IS NULL OR pre_archive_status IS NULL);
