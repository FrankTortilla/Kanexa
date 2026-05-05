'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const VALID_STATUSES = ['Pending', 'Booked', 'In Transit', 'Delivered', 'Cancelled'];

function normalizeStatus(status) {
  if (status === 'Shipped') return 'In Transit';
  if (!VALID_STATUSES.includes(status)) {
    console.warn(`Unknown shipment status: "${status}" — keeping raw value`);
  }
  return status;
}

function normalizeShipment(s) {
  return { ...s, status: normalizeStatus(s.status) };
}

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ship_date', direction: 'desc' });
  const [flashedId, setFlashedId] = useState(null);
  const [newShipmentAlert, setNewShipmentAlert] = useState(null); // { id, customer_name }

  // ── Cancelled count (includes archived cancelled rows) ─────────────────────
  const [cancelledCount, setCancelledCount] = useState(0);

  // ── Optimistic UI stability: dirty flag per shipment ──────────────────────
  // Any realtime update for a dirty shipment is suppressed until the timer clears.
  const dirtyShipments = useRef(new Set()); // Set<id>
  const dirtyTimers    = useRef({});         // { [id]: timeoutId }

  const markDirty = useCallback((id) => {
    dirtyShipments.current.add(id);
    if (dirtyTimers.current[id]) clearTimeout(dirtyTimers.current[id]);
    dirtyTimers.current[id] = setTimeout(() => {
      dirtyShipments.current.delete(id);
      delete dirtyTimers.current[id];
    }, 3000);
  }, []);

  // ── Race condition: per-shipment save sequence guard ──────────────────────
  // Tracks the latest save seq for each shipment id. Stale async responses
  // are identified and discarded before they can overwrite a newer save.
  const saveSeqMap = useRef({}); // { [id]: currentSeq }

  // Fetch a single shipment with its materials (used after realtime events)
  const fetchShipmentWithMaterials = useCallback(async (id) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('shipments')
      .select('*, shipment_materials(*)')
      .eq('id', id)
      .single();
    if (!error && data) return normalizeShipment(data);
    // Fallback: shipment_materials table may not exist yet
    const { data: fallback } = await supabase
      .from('shipments').select('*').eq('id', id).single();
    return fallback ? normalizeShipment({ ...fallback, shipment_materials: [] }) : null;
  }, []);

  // Fetch all non-deleted, non-archived shipments (active view)
  const fetchShipments = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select('*, shipment_materials(*)')
        .is('deleted_at', null)
        .is('archived_at', null)
        .order('ship_date', { ascending: false });
      if (fetchError) throw fetchError;
      setShipments((data || []).map(normalizeShipment));
    } catch (_joinErr) {
      // Fallback: shipment_materials table may not exist yet
      try {
        const { data, error: fallbackErr } = await supabase
          .from('shipments')
          .select('*')
          .is('deleted_at', null)
          .is('archived_at', null)
          .order('ship_date', { ascending: false });
        if (fallbackErr) throw fallbackErr;
        setShipments((data || []).map(s => normalizeShipment({ ...s, shipment_materials: [] })));
      } catch (err2) {
        setError(err2.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cancelled count — includes archived cancelled rows, excludes soft-deleted
  const fetchCancelledCount = useCallback(async () => {
    if (!supabase) return;
    const { count, error: countErr } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Cancelled')
      .is('deleted_at', null);
    if (!countErr) setCancelledCount(count || 0);
  }, []);

  // Fetch all shipments including deleted/archived (for history)
  const fetchAllShipments = useCallback(async () => {
    if (!supabase) return [];
    try {
      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select('*, shipment_materials(*)')
        .order('ship_date', { ascending: false });
      if (fetchError) throw fetchError;
      return (data || []).map(normalizeShipment);
    } catch (_joinErr) {
      // Fallback without materials join
      try {
        const { data, error: fallbackErr } = await supabase
          .from('shipments')
          .select('*')
          .order('ship_date', { ascending: false });
        if (fallbackErr) throw fallbackErr;
        return (data || []).map(s => normalizeShipment({ ...s, shipment_materials: [] }));
      } catch (err2) {
        setError(err2.message);
        return [];
      }
    }
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    fetchShipments();
    fetchCancelledCount();

    if (!supabase) return;
    const channel = supabase
      .channel('shipments-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Update cancelled count for newly inserted cancelled shipments
            if (payload.new.status === 'Cancelled' && !payload.new.deleted_at) {
              setCancelledCount(prev => prev + 1);
            }

            const full = await fetchShipmentWithMaterials(payload.new.id);
            setShipments(prev => {
              if (prev.some(s => s.id === payload.new.id)) return prev;
              return [full || payload.new, ...prev];
            });
            setFlashedId(payload.new.id);
            const inserted = full || payload.new;
            setNewShipmentAlert({ id: inserted.id, customer_name: inserted.customer_name || 'New shipment' });
            setTimeout(() => setNewShipmentAlert(null), 4000);

          } else if (payload.eventType === 'UPDATE') {
            // ── Maintain cancelled count ─────────────────────────────────────
            // A row counts toward cancelledCount if status='Cancelled' AND not soft-deleted
            const oldCountsAsCancelled = payload.old.status === 'Cancelled' && !payload.old.deleted_at;
            const newCountsAsCancelled = payload.new.status === 'Cancelled' && !payload.new.deleted_at;
            if (oldCountsAsCancelled !== newCountsAsCancelled) {
              setCancelledCount(prev => Math.max(0, prev + (newCountsAsCancelled ? 1 : -1)));
            }

            // If the row was just archived, remove it from the active list
            if (payload.new.archived_at && !payload.old.archived_at) {
              setShipments(prev => prev.filter(s => s.id !== payload.new.id));
              setTimeout(() => setFlashedId(null), 1000);
              return;
            }

            // If the row was just unarchived (archived_at cleared), re-fetch if not deleted
            if (!payload.new.archived_at && payload.old.archived_at && !payload.new.deleted_at) {
              const full = await fetchShipmentWithMaterials(payload.new.id);
              setShipments(prev => {
                if (prev.some(s => s.id === payload.new.id)) return prev;
                return [full || payload.new, ...prev];
              });
              setFlashedId(payload.new.id);
              setTimeout(() => setFlashedId(null), 1000);
              return;
            }

            // ── Dirty flag check ─────────────────────────────────────────────
            // If this shipment was recently saved locally, suppress the stale
            // realtime event so an optimistic UI update cannot be silently reverted.
            if (dirtyShipments.current.has(payload.new.id)) {
              setTimeout(() => setFlashedId(null), 1000);
              return;
            }

            const full = await fetchShipmentWithMaterials(payload.new.id);
            setShipments(prev =>
              prev.map(s => s.id === payload.new.id ? (full || normalizeShipment(payload.new)) : s)
            );
            setFlashedId(payload.new.id);

          } else if (payload.eventType === 'DELETE') {
            // Update cancelled count for hard-deleted cancelled rows
            if (payload.old.status === 'Cancelled') {
              setCancelledCount(prev => Math.max(0, prev - 1));
            }
            setShipments(prev => prev.filter(s => s.id !== payload.old.id));
          }

          setTimeout(() => setFlashedId(null), 1000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCancelledCount, fetchShipmentWithMaterials, fetchShipments]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createShipment = useCallback(async (shipmentData) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { materials, ...shipment } = shipmentData;
    const { data, error: createError } = await supabase
      .from('shipments')
      .insert([shipment])
      .select()
      .single();
    if (createError) throw createError;
    if (materials && materials.length > 0) {
      const rows = materials.map(m => ({
        shipment_id: data.id,
        quantity: m.quantity || null,
        material_name: m.material_name,
      }));
      const { error: matError } = await supabase.from('shipment_materials').insert(rows);
      if (matError) throw matError;
    }
    return data;
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateShipment = useCallback(async (id, updates) => {
    if (!supabase) throw new Error('Supabase not configured');

    // Sequence guard: tag this request so stale async responses can be discarded
    const mySeq = ((saveSeqMap.current[id] = (saveSeqMap.current[id] || 0) + 1));

    // Dirty flag: suppress realtime events for this shipment for 3 seconds
    // so a just-saved status cannot be silently reverted by a background event
    if ('status' in updates || 'stage' in updates) {
      markDirty(id);
    }

    const { materials, ...shipmentUpdates } = updates;

    // Optimistic local update — applied immediately, before the network round-trip
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...shipmentUpdates } : s));

    const { data, error: updateError } = await supabase
      .from('shipments')
      .update(shipmentUpdates)
      .eq('id', id)
      .select()
      .single();

    // Discard stale response if a newer save was initiated for this shipment
    if (saveSeqMap.current[id] !== mySeq) return data;

    if (updateError) throw updateError;

    if ('status' in updates) {
      fetchCancelledCount();
    }

    // Only touch materials if they were explicitly provided
    if (materials !== undefined) {
      await supabase.from('shipment_materials').delete().eq('shipment_id', id);
      let savedMaterials = [];
      if (materials.length > 0) {
        savedMaterials = materials.map(m => ({
          shipment_id: id,
          quantity: m.quantity || null,
          material_name: m.material_name,
        }));
        const { error: matError } = await supabase.from('shipment_materials').insert(savedMaterials);
        if (matError) throw matError;
      }
      // Write authoritative final materials into local state AFTER the DB insert
      // completes — wins the race against the realtime handler's [] materials window.
      setShipments(prev => prev.map(s =>
        s.id === id
          ? { ...s, ...shipmentUpdates, shipment_materials: savedMaterials }
          : s
      ));
    }

    return data;
  }, [fetchCancelledCount, markDirty]);

  // ── Soft-delete (also removes POD file from storage) ──────────────────────
  const deleteShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: existing } = await supabase
      .from('shipments')
      .select('pod_file_path, status')
      .eq('id', id)
      .single();
    const { error: deleteError } = await supabase
      .from('shipments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (deleteError) throw deleteError;
    if (existing?.pod_file_path) {
      await supabase.storage.from('pod-documents').remove([existing.pod_file_path]);
    }
    // If this was a cancelled shipment, decrement the cancelled count
    if (existing?.status === 'Cancelled') {
      setCancelledCount(prev => Math.max(0, prev - 1));
    }
    setShipments(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Restore (un-soft-delete) ───────────────────────────────────────────────
  const restoreShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: restoreError } = await supabase
      .from('shipments')
      .update({ deleted_at: null })
      .eq('id', id);
    if (restoreError) throw restoreError;
  }, []);

  // ── Archive — calls the atomic archive_shipment RPC ────────────────────────
  // The RPC captures pre_archive_stage/status, sets stage='archived', archived_at=NOW().
  const archiveShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.rpc('archive_shipment', { p_id: id });
    if (error) throw error;
    // Remove from active view immediately
    setShipments(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Unarchive — calls the atomic unarchive_shipment RPC ───────────────────
  // The RPC reads pre_archive_stage/status and restores them atomically.
  const unarchiveShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.rpc('unarchive_shipment', { p_id: id });
    if (error) throw error;
    // The realtime subscription will catch the archived_at→null change and
    // re-add the shipment to the active list with its restored status.
    // Fetch cancelled count in case this unarchived a cancelled shipment.
    fetchCancelledCount();
  }, [fetchCancelledCount]);

  // ── Hard-delete a shipment record permanently (History tab only) ──────────
  const permanentDeleteShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: existing, error: fetchErr } = await supabase
      .from('shipments')
      .select('pod_file_path, status')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    if (existing?.pod_file_path) {
      const { error: storageErr } = await supabase.storage
        .from('pod-documents')
        .remove([existing.pod_file_path]);
      if (storageErr) throw storageErr;
    }

    const { error: notesErr } = await supabase
      .from('shipment_notes')
      .delete()
      .eq('shipment_id', id);
    if (notesErr) throw notesErr;

    const { error: matsErr } = await supabase
      .from('shipment_materials')
      .delete()
      .eq('shipment_id', id);
    if (matsErr) throw matsErr;

    const { error: deleteErr } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);
    if (deleteErr) throw deleteErr;

    // The DELETE realtime event updates cancelledCount for Cancelled rows.
  }, []);

  // ── Archive all Delivered + unarchived shipments in one batch ──────────────
  const archiveAllDelivered = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const targets = shipments.filter(s => s.status === 'Delivered' && !s.archived_at);
    if (targets.length === 0) return 0;
    // All targets have status='Delivered', so pre_archive_status='Delivered',
    // pre_archive_stage='delivered'. Stage becomes 'archived'.
    const { error } = await supabase
      .from('shipments')
      .update({
        archived_at:        new Date().toISOString(),
        stage:              'archived',
        pre_archive_stage:  'delivered',
        pre_archive_status: 'Delivered',
      })
      .eq('status', 'Delivered')
      .is('archived_at', null);
    if (error) throw error;
    setShipments(prev => prev.filter(s => !(s.status === 'Delivered' && !s.archived_at)));
    return targets.length;
  }, [shipments]);

  // ── Check duplicate PO# ────────────────────────────────────────────────────
  const checkDuplicatePO = useCallback(async (poNumber, excludeId = null) => {
    if (!supabase) return false;
    let query = supabase
      .from('shipments')
      .select('id')
      .eq('po_number', poNumber);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;
    return data && data.length > 0;
  }, []);

  // ── Toggle sort ────────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  // ── Optimistically update pod_file_path after a successful upload ──────────
  const updatePodPath = useCallback((id, filePath) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, pod_file_path: filePath } : s));
  }, []);

  return {
    allShipments: shipments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    flashedId,
    newShipmentAlert,
    cancelledCount,
    createShipment,
    updateShipment,
    deleteShipment,
    restoreShipment,
    archiveShipment,
    unarchiveShipment,
    archiveAllDelivered,
    checkDuplicatePO,
    fetchShipments,
    fetchAllShipments,
    updatePodPath,
    permanentDeleteShipment,
  };
}
