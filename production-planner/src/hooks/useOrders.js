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

  // Fetch active (non-archived) orders
  const fetchOrders = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error: err } = await supabase
        .from('production_orders')
        .select('*')
        .eq('archived', false)
        .order('due_date', { ascending: true });
      if (err) throw err;
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all orders including archived (for archive view)
  const fetchAllOrders = useCallback(async () => {
    if (!supabase) return [];
    const { data, error: err } = await supabase
      .from('production_orders')
      .select('*')
      .order('due_date', { ascending: true });
    if (err) throw err;
    return data || [];
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
            if (!row.archived) {
              setOrders(prev => {
                if (prev.some(o => o.id === row.id)) return prev;
                return [...prev, row].sort((a, b) => {
                  if (a.cpu_asap && !b.cpu_asap) return -1;
                  if (!a.cpu_asap && b.cpu_asap) return 1;
                  return a.due_date < b.due_date ? -1 : 1;
                });
              });
              flash(row.id);
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            if (row.archived) {
              setOrders(prev => prev.filter(o => o.id !== row.id));
            } else {
              setOrders(prev =>
                prev.map(o => o.id === row.id ? row : o)
                  .sort((a, b) => {
                    if (a.cpu_asap && !b.cpu_asap) return -1;
                    if (!a.cpu_asap && b.cpu_asap) return 1;
                    return a.due_date < b.due_date ? -1 : 1;
                  })
              );
              flash(row.id);
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  // Log an activity entry for an order
  const logActivity = useCallback(async (orderId, action) => {
    if (!supabase) return;
    await supabase.from('production_order_activity').insert([{ order_id: orderId, action }]);
  }, []);

  // Create order
  const createOrder = useCallback(async (payload) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err } = await supabase
      .from('production_orders')
      .insert([payload])
      .select()
      .single();
    if (err) throw err;
    await logActivity(data.id, `Order created for ${data.customer} — ${data.order_type}`);
    // Immediately update local state — realtime will dedupe via the id check
    if (!data.archived) {
      setOrders(prev => {
        if (prev.some(o => o.id === data.id)) return prev;
        return [...prev, data].sort((a, b) => {
          if (a.cpu_asap && !b.cpu_asap) return -1;
          if (!a.cpu_asap && b.cpu_asap) return 1;
          return a.due_date < b.due_date ? -1 : 1;
        });
      });
      flash(data.id);
    }
    return data;
  }, [logActivity]);

  // Update order — detects changed fields and logs them
  const updateOrder = useCallback(async (id, updates, prevOrder) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;

    // Immediately reflect in local state
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, ...updates } : o)
        .sort((a, b) => {
          if (a.cpu_asap && !b.cpu_asap) return -1;
          if (!a.cpu_asap && b.cpu_asap) return 1;
          return a.due_date < b.due_date ? -1 : 1;
        })
    );

    // Log changes
    if (prevOrder) {
      const fieldLabels = {
        order_type: 'Order Type',
        start_date: 'Start Date',
        due_date: 'Due Date',
        customer: 'Customer',
        po_number: 'PO#',
        quantity: 'Qty',
        pvg: 'Pvg"',
        dowel_size: 'Dowel Size',
        oc: 'O.C.',
        coating: 'Coating',
        coating_other: 'Coating (Other)',
        num_dowels: '# of Dowels',
        total_lf: '# Total LF',
        status: 'Status',
        cpu_asap: 'CPU ASAP',
      };
      for (const [field, label] of Object.entries(fieldLabels)) {
        if (field in updates && updates[field] !== prevOrder[field]) {
          const oldVal = field === 'cpu_asap'
            ? (prevOrder[field] ? 'Yes' : 'No')
            : (prevOrder[field] ?? '—');
          const newVal = field === 'cpu_asap'
            ? (updates[field] ? 'Yes' : 'No')
            : (updates[field] ?? '—');
          await logActivity(id, `${label} changed: ${oldVal} → ${newVal}`);
        }
      }
    }

    return data;
  }, [logActivity]);

  // Archive order (sets archived = true)
  const archiveOrder = useCallback(async (id, customer) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: err } = await supabase
      .from('production_orders')
      .update({ archived: true })
      .eq('id', id);
    if (err) throw err;
    setOrders(prev => prev.filter(o => o.id !== id));
    await logActivity(id, `Order archived${customer ? ` (${customer})` : ''}`);
  }, [logActivity]);

  // Unarchive order (sets archived = false)
  const unarchiveOrder = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err } = await supabase
      .from('production_orders')
      .update({ archived: false })
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;
    setOrders(prev => [...prev, data].sort((a, b) => {
      if (a.cpu_asap && !b.cpu_asap) return -1;
      if (!a.cpu_asap && b.cpu_asap) return 1;
      return a.due_date < b.due_date ? -1 : 1;
    }));
    await logActivity(id, 'Order unarchived (restored to active)');
  }, [logActivity]);

  const handleSort = useCallback((key) => {
    // Sorting is done client-side in page.js; this is a no-op hook stub kept for API symmetry
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
    fetchAllOrders,
    logActivity,
  };
}
