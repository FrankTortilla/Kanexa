-- Migration: Sync active non-cancelled stage values to status
-- Cancelled rows intentionally keep their existing stage so they can be restored
-- to the tab they came from.

UPDATE shipments
SET stage = CASE
  WHEN status = 'Pending'    THEN 'pending'
  WHEN status = 'Booked'     THEN 'booked'
  WHEN status = 'In Transit' THEN 'in-transit'
  WHEN status = 'Delivered'  THEN 'delivered'
  ELSE stage
END
WHERE archived_at IS NULL
  AND deleted_at IS NULL
  AND status <> 'Cancelled';
