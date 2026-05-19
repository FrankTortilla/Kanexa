'use client';
import { Fragment, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ORDER_STATUSES, STATUS_BADGE_COLORS } from '../lib/constants';
import StatusBadge from './StatusBadge';

const TH = ({ children, style }) => (
  <th style={{
    padding: '9px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 600,
    fontFamily: 'var(--font-heading), Oswald, sans-serif', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
    background: '#363636', position: 'sticky', top: 0, zIndex: 1, ...style,
  }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{
    padding: '9px 10px', fontSize: '12px', color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
    whiteSpace: 'nowrap', ...style,
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
      const dropH = 220; // approximate height of 5-item status dropdown
      const opensUpward = r.bottom + dropH + 8 > window.innerHeight;
      setPos(opensUpward
        ? { bottom: window.innerHeight - r.top + 4, left: r.left }
        : { top: r.bottom + 4, left: r.left }
      );
    }
    setIsOpen(p => !p);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) setIsOpen(false);
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
    <div ref={dropRef} style={{
      position: 'fixed',
      ...(pos.bottom != null ? { bottom: pos.bottom } : { top: pos.top }),
      left: pos.left,
      zIndex: 9999,
      background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: '10px',
      padding: '6px', boxShadow: '0 6px 24px rgba(0,0,0,0.5)', minWidth: '148px',
    }}>
      {ORDER_STATUSES.map(s => {
        const sc = STATUS_BADGE_COLORS[s] || { bg: '#6b7280', text: '#ffffff' };
        const isCurrent = s === localStatus;
        return (
          <button key={s}
            onClick={async () => {
              setIsOpen(false);
              if (s !== localStatus) {
                const prev = localStatus;
                setLocalStatus(s);
                try { await onStatusChange(s); }
                catch { setLocalStatus(prev); }
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '6px 10px', marginBottom: '2px',
              background: isCurrent ? sc.bg : 'transparent',
              border: 'none', borderRadius: '7px',
              color: isCurrent ? sc.text : 'var(--text-primary)',
              textShadow: isCurrent ? (sc.textShadow || 'none') : 'none',
              fontSize: '12px', fontWeight: isCurrent ? 700 : 500,
              cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', fontFamily: 'inherit',
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
      <button ref={btnRef} onClick={handleToggle} style={{
        background: colors.bg, color: colors.text, textShadow: colors.textShadow || 'none',
        border: 'none', borderRadius: '20px',
        padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        minWidth: '110px', textAlign: 'center', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
        fontFamily: 'inherit',
      }}>
        {localStatus}
        <span style={{ fontSize: '9px', opacity: 0.8 }}>▾</span>
      </button>
      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}

function ActionsDropdown({ order, isHistory, onEdit, onArchive, onRestore, onDelete, openDropdownId, setOpenDropdownId }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pos, setPos] = useState({});
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const isOpen = openDropdownId === order.id;

  const setOpen = (val) => setOpenDropdownId(val ? order.id : null);

  const handleToggle = () => {
    if (!isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const dropH = isHistory ? 90 : 130;
      const top = spaceBelow < dropH + 8 ? r.top - dropH - 4 : r.bottom + 4;
      setPos({ top, left: r.right - 140 });
    }
    setOpen(!isOpen);
    setConfirmDelete(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => { setOpen(false); setConfirmDelete(false); };
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [isOpen]);

  const menuItems = isHistory
    ? [
        { label: 'Restore', dotColor: '#2563eb', action: () => { setOpen(false); onRestore(order); } },
        { label: 'Delete',  dotColor: '#ef4444', action: () => setConfirmDelete(true), danger: true },
      ]
    : [
        { label: 'Edit',    dotColor: '#2563eb', action: () => { setOpen(false); onEdit(order); } },
        { label: 'Archive', dotColor: '#9ca3af', action: () => { setOpen(false); onArchive(order); } },
        { label: 'Delete',  dotColor: '#ef4444', action: () => setConfirmDelete(true), danger: true },
      ];

  const dropdown = (
    <div ref={dropRef} style={{
      position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
      background: '#1e1e1e', border: '1px solid var(--border)', borderRadius: '10px',
      padding: '6px', boxShadow: '0 6px 24px rgba(0,0,0,0.55)', minWidth: '140px',
    }}>
      {confirmDelete ? (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.4 }}>
            Permanently delete this order? This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button onClick={() => setConfirmDelete(false)}
              style={{ ...dropBtn, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={() => { setOpen(false); setConfirmDelete(false); onDelete(order); }}
              style={{ ...dropBtn, background: '#ef4444', color: '#fff', border: 'none' }}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        menuItems.map(item => (
          <button key={item.label} onClick={item.action} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '7px 10px', marginBottom: '2px',
            background: 'transparent', border: 'none', borderRadius: '7px',
            color: item.danger ? '#ef4444' : 'var(--text-primary)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dotColor, flexShrink: 0 }} />
            {item.label}
          </button>
        ))
      )}
    </div>
  );

  return (
    <div style={{ display: 'inline-block' }}>
      <button ref={btnRef} onClick={handleToggle} style={{
        background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
        color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 10px',
        fontSize: '14px', fontFamily: 'inherit', lineHeight: 1,
        transition: 'border-color 0.15s, color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        ···
      </button>
      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}

const dropBtn = {
  padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  background: 'transparent',
};

// Column counts per tab (expand + data cols + actions)
// Baskets: 1+13+1=15  |  Loose Dowels: 1+9+1=11  |  EpoxyFab: 1+12+1=14  |  Accessories: 1+9+1=11
function colCount(orderType) {
  if (orderType === 'Baskets')      return 15;
  if (orderType === 'EpoxyFab')     return 14;
  if (orderType === 'Accessories')  return 11;
  return 11; // Loose Dowels
}

function OrderRow({ order, orderType, flashedId, onEdit, onArchive, onRestore, onDelete, onStatusChange, expandedId, onToggleExpand, renderActivityLog, isHistory, openDropdownId, setOpenDropdownId }) {
  const [hovered, setHovered] = useState(false);

  const isCpuAsap = !!order.cpu_asap;
  const isTolling = orderType === 'EpoxyFab' && !!order.tolling_only;
  const isFlashed = flashedId === order.id;
  const isExpanded = expandedId === order.id;
  const coatingLabel = order.coating === 'Other' && order.coating_other
    ? `Other: ${order.coating_other}`
    : order.coating;

  const startDateStyle = isCpuAsap ? { borderLeft: '3px solid #FF8C00' } : {};

  return (
    <Fragment>
      <tr
        className={`order-row${isCpuAsap ? ' cpu-asap-row' : ''}${isFlashed ? ' animate-row-flash' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#222222' : isCpuAsap ? 'rgba(255,140,0,0.06)' : 'transparent',
          transition: 'background 0.15s',
          opacity: isHistory ? 0.82 : 1,
        }}
      >
        {/* Expand toggle — all tabs; amber left stripe for EpoxyFab tolling rows */}
        <td style={{ padding: '9px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', ...(isTolling ? { borderLeft: '4px solid #F59E0B' } : {}) }}>
          <button onClick={() => onToggleExpand(order.id)} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '12px',
            transform: isExpanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▶</button>
        </td>

        {/* Common leading columns — all tabs */}
        <TD style={startDateStyle}>{formatDate(order.start_date)}</TD>
        <TD>{formatDate(order.due_date)}</TD>
        <TD style={{ fontWeight: 600 }}>{order.customer}</TD>
        <TD style={{ color: 'var(--text-secondary)' }}>{order.po_number || '—'}</TD>
        <TD style={{ textAlign: 'right', fontWeight: 600 }}>{order.quantity?.toLocaleString() ?? '—'}</TD>

        {/* Tab-specific middle columns */}
        {orderType === 'Baskets' && (
          <>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.pvg || '—'}</TD>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.dowel_size || '—'}</TD>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.oc || '—'}</TD>
            <TD>{coatingLabel || '—'}</TD>
            <TD style={{ textAlign: 'right' }}>{order.num_dowels?.toLocaleString() ?? '—'}</TD>
            <TD style={{ textAlign: 'right' }}>{order.total_lf?.toLocaleString() ?? '—'}</TD>
          </>
        )}
        {orderType === 'Loose Dowels' && (
          <>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.dowel_size || '—'}</TD>
            <TD>{coatingLabel || '—'}</TD>
          </>
        )}
        {orderType === 'EpoxyFab' && (
          <>
            <TD style={{ textAlign: 'right' }}>{order.weight != null ? order.weight.toLocaleString() : '—'}</TD>
            <TD>{coatingLabel || '—'}</TD>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.bar_size || '—'}</TD>
            <TD style={{ color: 'var(--text-secondary)' }}>{order.bar_length || '—'}</TD>
            <TD style={{ color: 'var(--text-secondary)', maxWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {order.fabrication || '—'}
                </span>
                {order.tolling_only && (
                  <span style={{
                    background: 'var(--accent-green)', color: '#1a1a1a',
                    borderRadius: '4px', padding: '2px 5px',
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.3px', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>TOLLING</span>
                )}
              </div>
            </TD>
          </>
        )}
        {orderType === 'Accessories' && (
          <>
            <TD style={{ textAlign: 'right' }}>{order.total_lf != null ? order.total_lf.toLocaleString() : '—'}</TD>
            <TD style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
              {order.description || '—'}
            </TD>
          </>
        )}

        {/* Common trailing columns — all tabs */}
        <TD>
          {isHistory
            ? <StatusBadge status={order.status} />
            : <StatusDropdown currentStatus={order.status} onStatusChange={(s) => onStatusChange(order.id, s)} />
          }
        </TD>
        <TD style={{ textAlign: 'center' }}>
          {isCpuAsap ? (
            <span style={{
              display: 'inline-block', padding: '3px 8px',
              background: '#FF8C00', color: '#000',
              borderRadius: '6px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px',
            }}>ASAP</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
          )}
        </TD>
        <TD style={{ textAlign: 'center' }}>
          <ActionsDropdown
            order={order}
            isHistory={isHistory}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onDelete={onDelete}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
          />
        </TD>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={colCount(orderType)} style={{
            padding: '0 24px 16px 56px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}>
            {renderActivityLog(order.id, orderType === 'Accessories' ? order.description : null)}
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default function OrderTable({ orders, orderType, flashedId, onEdit, onArchive, onRestore, onDelete, onStatusChange, expandedId, onToggleExpand, renderActivityLog, isHistory }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (openDropdownId && !orders.some(o => o.id === openDropdownId)) {
      setOpenDropdownId(null);
    }
  }, [orders, openDropdownId]);

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

            {orderType === 'Baskets' && (
              <>
                <TH>Pvg&quot;</TH>
                <TH>Dowel Size</TH>
                <TH>O.C.</TH>
                <TH>Coating</TH>
                <TH style={{ textAlign: 'right' }}># Dowels</TH>
                <TH style={{ textAlign: 'right' }}>Total LF</TH>
              </>
            )}
            {orderType === 'Loose Dowels' && (
              <>
                <TH>Dowel Size</TH>
                <TH>Coating</TH>
              </>
            )}
            {orderType === 'EpoxyFab' && (
              <>
                <TH style={{ textAlign: 'right' }}>Weight (lbs)</TH>
                <TH>Coating</TH>
                <TH>Bar Size</TH>
                <TH>Bar Length</TH>
                <TH>Fabrication</TH>
              </>
            )}
            {orderType === 'Accessories' && (
              <>
                <TH style={{ textAlign: 'right' }}>LF</TH>
                <TH>Notes</TH>
              </>
            )}

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
              orderType={orderType}
              flashedId={flashedId}
              onEdit={onEdit}
              onArchive={onArchive}
              onRestore={onRestore}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              expandedId={expandedId}
              onToggleExpand={onToggleExpand}
              renderActivityLog={renderActivityLog}
              isHistory={isHistory}
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
