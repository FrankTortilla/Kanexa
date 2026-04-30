'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ActivityLog({ orderId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !orderId) { setLoading(false); return; }
    supabase
      .from('production_order_activity')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries(data || []);
        setLoading(false);
      });
  }, [orderId]);

  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #222' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Activity Log
      </div>
      {loading ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>No activity recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {entries.map(entry => (
            <div key={entry.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: '130px', paddingTop: '1px' }}>
                {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {entry.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
