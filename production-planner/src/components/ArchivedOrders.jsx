'use client';
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${m}/${day}/${y.slice(2)}`;
}

const TH = ({ children, style }) => (
  <th style={{
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border)',
    ...style,
  }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid #222',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    ...style,
  }}>
    {children}
  </td>
);

export default function ArchivedOrders({ fetchAllOrders, onUnarchive }) {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    fetchAllOrders().then(data => {
      setAllOrders(data.filter(o => o.archived));
      setLoading(false);
    });
  }, [fetchAllOrders]);

  const ORDER_TYPE_TABS = ['All', 'Baskets', 'Loose Dowels', 'EpoxyFab'];
  const visible = tab === 'All' ? allOrders : allOrders.filter(o => o.order_type === tab);

  const handleUnarchive = async (order) => {
    await onUnarchive(order.id);
    setAllOrders(prev => prev.filter(o => o.id !== order.id));
  };

  return (
    <div style={{ flex: 1 }}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: '0', padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        background: '#111',
      }}>
        {ORDER_TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent-green)' : '2px solid transparent',
              color: tab === t ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: tab === t ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-1px',
            }}
          >
            {t}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              ({(t === 'All' ? allOrders : allOrders.filter(o => o.order_type === t)).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading archived orders…</div>
      ) : visible.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4 }}>🗄</div>
          <p>No archived orders{tab !== 'All' ? ` for ${tab}` : ''}.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#363636' }}>
              <tr>
                <TH>Type</TH>
                <TH>Start Date</TH>
                <TH>Due Date</TH>
                <TH>Customer</TH>
                <TH>PO#</TH>
                <TH style={{ textAlign: 'right' }}>Qty</TH>
                <TH>Coating</TH>
                <TH style={{ textAlign: 'right' }}>Total LF</TH>
                <TH>Status</TH>
                <TH style={{ textAlign: 'center' }}>Restore</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(order => {
                const coatingLabel = order.coating === 'Other' && order.coating_other
                  ? `Other: ${order.coating_other}`
                  : order.coating;
                return (
                  <tr key={order.id} style={{ opacity: 0.75 }}>
                    <TD style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.order_type}</TD>
                    <TD>{formatDate(order.start_date)}</TD>
                    <TD>{formatDate(order.due_date)}</TD>
                    <TD style={{ color: 'var(--text-primary)' }}>{order.customer}</TD>
                    <TD>{order.po_number || '—'}</TD>
                    <TD style={{ textAlign: 'right' }}>{order.quantity?.toLocaleString() ?? '—'}</TD>
                    <TD>{coatingLabel || '—'}</TD>
                    <TD style={{ textAlign: 'right' }}>{order.total_lf?.toLocaleString() ?? '—'}</TD>
                    <TD><StatusBadge status={order.status} /></TD>
                    <TD style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleUnarchive(order)}
                        style={{
                          padding: '5px 12px',
                          background: 'transparent',
                          border: '1px solid var(--accent-green)',
                          color: 'var(--accent-green)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Restore
                      </button>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
