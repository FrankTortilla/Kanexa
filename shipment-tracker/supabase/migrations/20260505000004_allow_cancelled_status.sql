-- Migration: Allow Cancelled shipment status
-- Keeps the existing status check aligned with the app's status dropdown.

ALTER TABLE shipments
  DROP CONSTRAINT IF EXISTS shipments_status_check;

ALTER TABLE shipments
  ADD CONSTRAINT shipments_status_check
  CHECK (status IN ('Pending', 'Booked', 'In Transit', 'Delivered', 'Cancelled'));
