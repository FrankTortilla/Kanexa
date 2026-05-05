-- Migration: Harden archive RPC functions
-- These RPCs do not need elevated privileges while the app uses open RLS
-- policies, so keep them as SECURITY INVOKER and pin search_path.

ALTER FUNCTION public.archive_shipment(uuid)
  SECURITY INVOKER
  SET search_path = public;

ALTER FUNCTION public.unarchive_shipment(uuid)
  SECURITY INVOKER
  SET search_path = public;

ALTER FUNCTION public.update_updated_at()
  SET search_path = public;
