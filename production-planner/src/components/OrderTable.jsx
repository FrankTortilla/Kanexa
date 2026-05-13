'use client';
import { Fragment, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ORDER_STATUSES, STATUS_BADGE_COLORS } from '../lib/constants';

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

// Portal-based status dropdown — escapes overflow clipping
function StatusDropdown({ currentStatus, onStatusChange }) {
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({});
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => { setLocalStatus(currentStatus); }, [currentStatus]);

  const handleToggle = () => {
    if (!isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setIsOpen(p => !p);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setIsOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [isOpen]);

  const colors = STATUS_BADGE_COLORS[localStatus] || { bg: '#6b7280', text: '#ffffff' };

  const dropdown = (
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        background: '#1a1a1a',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '6px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        minWidth: '148px',
      }}
    >
      {ORDER_STATUSES.map(s => {
        const sc = STATUS_BADGE_COLORS[s] || { bg: '#6b7280', text: '#ffffff' };
        const isCurrent = s === localStatus;
        return (
          <button
            key={s}
            onClick={async () => {
              setIsOpen(false);
              if (s !== localStatus) {
                const prev = localStatus;
                setLocalStatus(s);
                try { await onStatusChange(s); }
                catch (err) { console.error('Status update failed:', err?.message); setLocalStatus(prev); }
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '6px 10px', marginBottom: '2px',
              background: isCurrent ? sc.bg : 'transparent',
              border: 'none', borderRadius: '7px',
              color: isCurrent ? sc.text : 'var(--text-primary)',
              fontSize: '12px', fontWeight: isCurrent ? 700 : 500,
              cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.bg, flexShrink: 0 }} />
            {s}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          background: colors.bg, color: colors.text,
          border: 'none', borderRadius: '20px',
          padding: '4px 10px', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', minWidth: '110px', textAlign: 'center',
          whiteSpace: 'nowrap', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', gap: '5px',
          fontFamily: 'inherit',
        }}
      >
        {localStatus}
        <span style={{ fontSize: '9px', opacity: 0.8 }}>▾</span>
      </button>
      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}

// Extracted row component so each row has independent hover + confirm state
function OrderRow({ order, flashedId, onEdit, onArchive, onStatusChange, expandedId, onToggleExpand, renderActivityLog }) {
  const [hovered, setHovered] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const isCpuAsap = !!order.cpu_asap;
  const isFlashed = flashedId === order.id;
  const isExpanded = expandedId === order.id;
  const coatingLabel = order.coating === 'Other' && order.coating_other
    ? `Other: ${order.coating_other}`
    : order.coating;

  return (
    <Fragment>
      <tr
        className={`order-row${isCpuAsap ? ' cpu-asap-row' : ''}${isFlashed ? ' animate-row-flash' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#222222' : isCpuAsap ? 'rgba(255,140,0,0.06)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <td style={{ padding: '9px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
          <button
            onClick={() => onToggleExpand(order.id)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '12px',
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >▶</button>
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
        <TD>
          <StatusDropdown
            currentStatus={order.status}
            onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
          />
        </TD>
        <TD style={{ textAlign: 'center' }}>
          {isCpuAsap ? (
            <span style={{
              display: 'inline-block', padding: '3px 8px',
              background: '#FF8C00', color: '#000',
              borderRadius: '6px', fontSize: '10px',
              fontWeight: 800, letterSpacing: '0.5px',
            }}>ASAP</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
          )}
        </TD>
        <TD style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          {confirmingArchive ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Archive?</span>
              <button onClick={() => setConfirmingArchive(false)} style={{ ...actionBtn, fontSize: '11px', color: 'var(--text-secondary)' }}>No</button>
              <button onClick={() => { setConfirmingArchive(false); onArchive(order); }} style={{ ...actionBtn, fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>Yes</button>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', gap: '2px' }}>
              <button onClick={() => onEdit(order)} style={actionBtn}>Edit</button>
              <button onClick={() => setConfirmingArchive(true)} style={{ ...actionBtn, color: 'var(--text-secondary)' }}>Archive</button>
            </span>
          )}
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
}

export default function OrderTable({ orders, flashedId, onEdit, onArchive, onStatusChange, expandedId, onToggleExpand, renderActivityLog }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ overflowX: 'auto', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', fontSize: '12px' }}>
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
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              flashedId={flashedId}
              onEdit={onEdit}
              onArchive={onArchive}
              onStatusChange={onStatusChange}
              expandedId={expandedId}
              onToggleExpand={onToggleExpand}
              renderActivityLog={renderActivityLog}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const actionBtn = {
  background: 'none', border: 'none',
  color: 'var(--accent-green)',
  cursor: 'pointer', fontSize: '12px',
  fontWeight: 600, padding: '4px 6px',
  fontFamily: 'inherit',
};
