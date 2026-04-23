'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ship_date', direction: 'desc' });
  const [flashedId, setFlashedId] = useState(null);
  const [newShipmentAlert, setNewShipmentAlert] = useState(null); // { id, customer_name }

  const VALID_STATUSES = ['Pending', 'Booked', 'In Transit', 'Delivered'];
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

  // Fetch a single shipment with its materials (used after realtime events)
  const fetchShipmentWithMaterials = async (id) => {
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
  };

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
      // Fallback: shipment_materials table may not exist yet — load shipments without it
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

  // Fetch all shipments including deleted/delivered (for history)
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

  // Realtime subscription
  useEffect(() => {
    fetchShipments();

    if (!supabase) return;
    const channel = supabase
      .channel('shipments-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
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
            // If the row was just archived, remove it from the active list
            if (payload.new.archived_at && !payload.old.archived_at) {
              setShipments(prev => prev.filter(s => s.id !== payload.new.id));
              return;
            }
            // If the row was just unarchived (archived_at cleared), re-fetch it if not deleted
            if (!payload.new.archived_at && payload.old.archived_at && !payload.new.deleted_at) {
              const full = await fetchShipmentWithMaterials(payload.new.id);
              setShipments(prev => {
                if (prev.some(s => s.id === payload.new.id)) return prev;
                return [full || payload.new, ...prev];
              });
              setFlashedId(payload.new.id);
              return;
            }
            const full = await fetchShipmentWithMaterials(payload.new.id);
            setShipments(prev =>
              prev.map(s => s.id === payload.new.id ? (full || payload.new) : s)
            );
            setFlashedId(payload.new.id);
          } else if (payload.eventType === 'DELETE') {
            setShipments(prev => prev.filter(s => s.id !== payload.old.id));
          }
          setTimeout(() => setFlashedId(null), 1000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchShipments]);

  // Create
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

  // Update
  const updateShipment = useCallback(async (id, updates) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { materials, ...shipmentUpdates } = updates;
    const { data, error: updateError } = await supabase
      .from('shipments')
      .update(shipmentUpdates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;
    // Immediately reflect the change in local state — don't wait for realtime
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...shipmentUpdates } : s));
    // Only touch materials if they were explicitly provided
    if (materials !== undefined) {
      await supabase.from('shipment_materials').delete().eq('shipment_id', id);
      if (materials.length > 0) {
        const rows = materials.map(m => ({
          shipment_id: id,
          quantity: m.quantity || null,
          material_name: m.material_name,
        }));
        const { error: matError } = await supabase.from('shipment_materials').insert(rows);
        if (matError) throw matError;
      }
    }
    return data;
  }, []);

  // Soft-delete (also removes POD file from storage if one exists)
  const deleteShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    // Fetch pod_file_path before deleting so we can clean up storage
    const { data: existing } = await supabase
      .from('shipments')
      .select('pod_file_path')
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
    setShipments(prev => prev.filter(s => s.id !== id));
  }, []);

  // Restore (un-soft-delete)
  const restoreShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: restoreError } = await supabase
      .from('shipments')
      .update({ deleted_at: null })
      .eq('id', id);
    if (restoreError) throw restoreError;
  }, []);

  // Archive — sets archived_at = NOW() (never deletes data)
  const archiveShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('shipments')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    // Remove from active view immediately
    setShipments(prev => prev.filter(s => s.id !== id));
  }, []);

  // Unarchive — sets archived_at = NULL (returns to active view)
  const unarchiveShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('shipments')
      .update({ archived_at: null })
      .eq('id', id);
    if (error) throw error;
  }, []);

  // Archive all Delivered + unarchived shipments in one batch
  const archiveAllDelivered = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const targets = shipments.filter(s => s.status === 'Delivered' && !s.archived_at);
    if (targets.length === 0) return 0;
    const { error } = await supabase
      .from('shipments')
      .update({ archived_at: new Date().toISOString() })
      .eq('status', 'Delivered')
      .is('archived_at', null);
    if (error) throw error;
    setShipments(prev => prev.filter(s => !(s.status === 'Delivered' && !s.archived_at)));
    return targets.length;
  }, [shipments]);

  // Check duplicate PO#
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

  // Toggle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  // Optimistically update pod_file_path in local state after a successful upload
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
  };
}
