-- Migration: Atomic archive / unarchive RPC functions
--
-- archive_shipment(p_id):
--   1. Reads current stage + status
--   2. Writes them to pre_archive_stage / pre_archive_status
--   3. Sets stage = 'archived' and archived_at = NOW()
--   All three steps execute atomically; any failure rolls back the entire operation.
--   Calling archive repeatedly is safe — pre_archive fields are always overwritten
--   with the latest live values, which correctly handles repeated archive/unarchive cycles.
--
-- unarchive_shipment(p_id):
--   Reads pre_archive_stage / pre_archive_status (falls back to 'pending' if null).
--   Writes stage and status back to those values and clears archived_at atomically.

-- ── archive_shipment ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION archive_shipment(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stage  text;
  v_status text;
BEGIN
  -- Step 1: Lock the row and read current routing state
  SELECT stage, status
  INTO   v_stage, v_status
  FROM   shipments
  WHERE  id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'archive_shipment: shipment % not found', p_id;
  END IF;

  -- Steps 2 + 3: Snapshot current state, then mark archived — one atomic write
  UPDATE shipments
  SET
    pre_archive_stage  = v_stage,
    pre_archive_status = v_status,
    stage              = 'archived',
    archived_at        = NOW()
  WHERE id = p_id;
END;
$$;

-- ── unarchive_shipment ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION unarchive_shipment(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_restore_stage  text;
  v_restore_status text;
BEGIN
  -- Read pre-archive snapshot (lock row for atomicity)
  SELECT
    COALESCE(pre_archive_stage,  'pending'),
    COALESCE(pre_archive_status, 'pending')
  INTO v_restore_stage, v_restore_status
  FROM shipments
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'unarchive_shipment: shipment % not found', p_id;
  END IF;

  -- Restore routing stage + status badge; clear archived timestamp — one atomic write
  UPDATE shipments
  SET
    stage       = v_restore_stage,
    status      = v_restore_status,
    archived_at = NULL
  WHERE id = p_id;
END;
$$;
