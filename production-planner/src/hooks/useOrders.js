'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashedId, setFlashedId] = useState(null);

  const flash = (id) => {
    setFlashedId(id);
    setTimeout(() => setFlashedId(null), 1000);
  };

  const sortOrders = (list) =>
    [...list].sort((a, b) => {
      if (a.cpu_asap && !b.cpu_asap) return -1;
      if (!a.cpu_asap && b.cpu_asap) return 1;
      return (a.due_date ?? '') < (b.due_date ?? '') ? -1 : 1;
    });

  // Fetch ALL orders (active + archived) so History tab works client-side
  const fetchOrders = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error: err } = await supabase
        .from('production_orders')
        .select('*')
        .order('due_date', { ascending: true });
      if (err) throw err;
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchOrders();
    if (!supabase) return;

    const channel = supabase
      .channel('production-orders-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'production_orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            setOrders(prev => {
              if (prev.some(o => o.id === row.id)) return prev;
              return sortOrders([...prev, row]);
            });
            flash(row.id);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            setOrders(prev => sortOrders(prev.map(o => o.id === row.id ? row : o)));
            flash(row.id);
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const logActivity = useCallback(async (orderId, action) => {
    if (!supabase) return;
    await supabase.from('production_order_activity').insert([{ order_id: orderId, action }]);
  }, []);

  const createOrder = useCallback(async (payload) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err } = await supabase
      .from('production_orders')
      .insert([payload])
      .select()
      .single();
    if (err) throw err;
    setOrders(prev => {
      if (prev.some(o => o.id === data.id)) return prev;
      return sortOrders([...prev, data]);
    });
    flash(data.id);
    await logActivity(data.id, `Order created for ${data.customer} — ${data.order_type}`);
    return data;
  }, [logActivity]);

  const updateOrder = useCallback(async (id, updates, prevOrder) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;

    setOrders(prev => sortOrders(prev.map(o => o.id === id ? { ...o, ...updates } : o)));

    if (prevOrder) {
      const fieldLabels = {
        order_type:    'Order Type',    start_date:    'Start Date',  due_date:  'Due Date',
        customer:      'Customer',      po_number:     'PO#',         quantity:  'Qty',
        pvg:           'Pvg"',          dowel_size:    'Dowel Size',  oc:        'O.C.',
        coating:       'Coating',       coating_other: 'Coating (Other)',
        num_dowels:    '# of Dowels',   total_lf:      '# Total LF',
        status:        'Status',        cpu_asap:      'CPU ASAP',
        bar_size:      'Bar Size',      bar_length:    'Bar Length',
        weight:        'Weight',        fabrication:   'Fabrication',
        tolling_only:  'Tolling Only',  description:   'Description',
      };
      const booleanFields = new Set(['cpu_asap', 'tolling_only']);
      for (const [field, label] of Object.entries(fieldLabels)) {
        if (field in updates && updates[field] !== prevOrder[field]) {
          const oldVal = booleanFields.has(field) ? (prevOrder[field] ? 'Yes' : 'No') : (prevOrder[field] ?? '—');
          const newVal = booleanFields.has(field) ? (updates[field] ? 'Yes' : 'No') : (updates[field] ?? '—');
          await logActivity(id, `${label} changed: ${oldVal} → ${newVal}`);
        }
      }
    }

    return data;
  }, [logActivity]);

  const archiveOrder = useCallback(async (id, customer, currentStatus) => {
    if (!supabase) throw new Error('Supabase not configured');
    const updates = { archived: true, ...(currentStatus ? { pre_archive_status: currentStatus } : {}) };
    const { error: err } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id);
    if (err) throw err;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    await logActivity(id, `Order archived${customer ? ` (${customer})` : ''}`);
  }, [logActivity]);

  const unarchiveOrder = useCallback(async (id, restoreStatus = 'In Production') => {
    if (!supabase) throw new Error('Supabase not configured');
    const updates = { archived: false, status: restoreStatus, pre_archive_status: null };
    const { data, error: err } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;
    setOrders(prev => sortOrders(prev.map(o => o.id === id ? data : o)));
    await logActivity(id, `Order restored to active (${restoreStatus})`);
  }, [logActivity]);

  const deleteOrder = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: err } = await supabase
      .from('production_orders')
      .delete()
      .eq('id', id);
    if (err) throw err;
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  return {
    orders,
    loading,
    error,
    flashedId,
    createOrder,
    updateOrder,
    archiveOrder,
    unarchiveOrder,
    deleteOrder,
    logActivity,
  };
}
