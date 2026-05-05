-- Migration: Add stage and pre-archive columns
-- Adds a routing stage field (pending/booked/in-transit/delivered/archived)
-- and pre-archive state snapshots so unarchive can restore exact prior state.

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS stage             text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pre_archive_stage  text,
  ADD COLUMN IF NOT EXISTS pre_archive_status text;

COMMENT ON COLUMN shipments.stage
  IS 'Routing tab: pending | booked | in-transit | delivered | archived';

COMMENT ON COLUMN shipments.pre_archive_stage
  IS 'Snapshot of stage captured at archive time, used by unarchive to restore tab placement';

COMMENT ON COLUMN shipments.pre_archive_status
  IS 'Snapshot of status captured at archive time, used by unarchive to restore status badge';
