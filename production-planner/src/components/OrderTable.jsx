'use client';
import { Fragment, useState } from 'react';
import StatusBadge from './StatusBadge';

const TH = ({ children, style }) => (
  <th style={{
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #333333',
    ...style,
  }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{
    padding: '10px 12px',
    fontSize: '13px',
    color: '#ffffff',
    borderBottom: '1px solid #333333',
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
  const [search, setSearch] = useState('');

  if (!orders || orders.length === 0) return null;

  const filtered = search.trim()
    ? orders.filter(o =>
        (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.po_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.status || '').toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Search bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #333333' }}>
        <input
          type="text"
          placeholder="Search orders…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 14px',
            background: '#2a2a2a',
            border: '1px solid #333333',
            borderRadius: '7px',
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#888888', textAlign: 'right' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead style={{ background: 'var(--bg-primary)', position: 'sticky', top: '0', zIndex: 10 }}>
            <tr>
              <TH style={{ width: '32px' }} />
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
            {filtered.map((order) => {
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
                    }}
                  >
                    {/* Expand button — leftmost column */}
                    <TD style={{ padding: '10px 8px 10px 16px', width: '32px' }}>
                      <button
                        onClick={() => onToggleExpand(order.id)}
                        title="Activity log"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888888',
                          fontSize: '10px',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          lineHeight: 1,
                          fontFamily: 'inherit',
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </TD>
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
                        <span style={{ color: '#444', fontSize: '12px' }}>—</span>
                      )}
                    </TD>
                    <TD style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          onClick={() => onEdit(order)}
                          title="Edit"
                          style={actionBtn('var(--accent-green)', '#fff')}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onArchive(order)}
                          title="Archive"
                          style={actionBtn('#333', '#94A3B8')}
                        >
                          🗄
                        </button>
                      </div>
                    </TD>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={15} style={{ padding: 0, background: '#222222', borderBottom: '1px solid #333333' }}>
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
    </div>
  );
}

function actionBtn(bg, color) {
  return {
    padding: '5px 10px',
    background: bg,
    color,
    border: 'none',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
