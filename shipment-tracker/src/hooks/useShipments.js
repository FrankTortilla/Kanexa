'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'ship_date', direction: 'desc' });
  const [flashedId, setFlashedId] = useState(null);

  // Fetch all non-deleted shipments
  const fetchShipments = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select('*')
        .is('deleted_at', null)
        .order('ship_date', { ascending: false });
      if (fetchError) throw fetchError;
      setShipments(data || []);
    } catch (err) {
      setError(err.message);
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
        .select('*')
        .order('ship_date', { ascending: false });
      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setShipments(prev => {
              if (prev.some(s => s.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
            setFlashedId(payload.new.id);
          } else if (payload.eventType === 'UPDATE') {
            setShipments(prev =>
              prev.map(s => s.id === payload.new.id ? payload.new : s)
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
  const createShipment = useCallback(async (shipment) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: createError } = await supabase
      .from('shipments')
      .insert([shipment])
      .select()
      .single();
    if (createError) throw createError;
    return data;
  }, []);

  // Update
  const updateShipment = useCallback(async (id, updates) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: updateError } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;
    return data;
  }, []);

  // Soft-delete
  const deleteShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: deleteError } = await supabase
      .from('shipments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (deleteError) throw deleteError;
    // Remove from local state immediately
    setShipments(prev => prev.filter(s => s.id !== id));
  }, []);

  // Restore
  const restoreShipment = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: restoreError } = await supabase
      .from('shipments')
      .update({ deleted_at: null })
      .eq('id', id);
    if (restoreError) throw restoreError;
  }, []);

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

  // Client-side sorting
  const sortedShipments = useMemo(() => {
    const sorted = [...shipments].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [shipments, sortConfig]);

  // Client-side search filtering
  const searchFields = ['customer_name', 'city', 'state', 'material', 'po_number', 'carrier_name', 'tracking_number', 'special_instructions'];

  const filteredShipments = useMemo(() => {
    let result = sortedShipments;

    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        searchFields.some(field => s[field] && String(s[field]).toLowerCase().includes(q))
      );
    }

    return result;
  }, [sortedShipments, searchQuery, statusFilter]);

  // Toggle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  return {
    shipments: filteredShipments,
    allShipments: shipments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortConfig,
    handleSort,
    flashedId,
    createShipment,
    updateShipment,
    deleteShipment,
    restoreShipment,
    checkDuplicatePO,
    fetchShipments,
    fetchAllShipments,
  };
}
