'use client';
import { Fragment } from 'react';
import StatusBadge from './StatusBadge';

const TH = ({ children, style }) => (
  <th style={{
    padding: '9px 10px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-heading), Oswald, sans-serif',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    background: '#363636',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    ...style,
  }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{
    padding: '9px 10px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    ...style,
  }}>
    {children}
  </td>
);

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${m}/${day}/${y.slice(2)}`;
}

export default function OrderTable({ orders, flashedId, onEdit, onArchive, expandedId, onToggleExpand, renderActivityLog }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ overflowX: 'auto', flex: 1 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'auto',
        fontSize: '12px',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <TH />
            <TH>Start Date</TH>
            <TH>Due Date</TH>
            <TH>Customer</TH>
            <TH>PO#</TH>
            <TH style={{ textAlign: 'right' }}>Qty (ea)</TH>
            <TH>Pvg&quot;</TH>
            <TH>Dowel Size</TH>
            <TH>O.C.</TH>
            <TH>Coating</TH>
            <TH style={{ textAlign: 'right' }}># Dowels</TH>
            <TH style={{ textAlign: 'right' }}>Total LF</TH>
            <TH>Status</TH>
            <TH style={{ textAlign: 'center' }}>CPU ASAP</TH>
            <TH style={{ textAlign: 'center' }}>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isCpuAsap = !!order.cpu_asap;
            const isFlashed = flashedId === order.id;
            const isExpanded = expandedId === order.id;
            const coatingLabel = order.coating === 'Other' && order.coating_other
              ? `Other: ${order.coating_other}`
              : order.coating;

            return (
              <Fragment key={order.id}>
                <tr
                  className={`order-row${isCpuAsap ? ' cpu-asap-row' : ''}${isFlashed ? ' animate-row-flash' : ''}`}
                  style={{
                    background: isCpuAsap ? 'rgba(255, 140, 0, 0.06)' : 'transparent',
                    cursor: 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Expand button */}
                  <td style={{ padding: '9px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                    <button
                      onClick={() => onToggleExpand(order.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    >
                      ▶
                    </button>
                  </td>
                  <TD style={isCpuAsap ? { borderLeft: '3px solid #FF8C00' } : {}}>{formatDate(order.start_date)}</TD>
                  <TD>{formatDate(order.due_date)}</TD>
                  <TD style={{ fontWeight: 600 }}>{order.customer}</TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>{order.po_number || '—'}</TD>
                  <TD style={{ textAlign: 'right', fontWeight: 600 }}>{order.quantity?.toLocaleString() ?? '—'}</TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>{order.pvg || '—'}</TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>{order.dowel_size || '—'}</TD>
                  <TD style={{ color: 'var(--text-secondary)' }}>{order.oc || '—'}</TD>
                  <TD>{coatingLabel || '—'}</TD>
                  <TD style={{ textAlign: 'right' }}>{order.num_dowels?.toLocaleString() ?? '—'}</TD>
                  <TD style={{ textAlign: 'right' }}>{order.total_lf?.toLocaleString() ?? '—'}</TD>
                  <TD><StatusBadge status={order.status} /></TD>
                  <TD style={{ textAlign: 'center' }}>
                    {isCpuAsap ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: '#FF8C00',
                        color: '#000',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                      }}>
                        ASAP
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
                    )}
                  </TD>
                  <TD style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      <button onClick={() => onEdit(order)} style={actionBtn}>Edit</button>
                      <button onClick={() => onArchive(order)} style={{ ...actionBtn, color: 'var(--text-secondary)' }}>Archive</button>
                    </span>
                  </TD>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={15} style={{
                      padding: '0 24px 16px 56px',
                      background: 'var(--bg-surface)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {renderActivityLog(order.id)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const actionBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--accent-green)',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 6px',
  fontFamily: 'inherit',
};
