'use client';
import { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, truncateText } from '../utils/formatters';

// Inline dropdown color palette (solid, white text)
const STATUS_COLORS_DROPDOWN = {
  'Pending':    { bg: '#f59e0b', text: '#ffffff' },
  'Booked':     { bg: '#3b82f6', text: '#ffffff' },
  'In Transit': { bg: '#f97316', text: '#ffffff' },
  'Delivered':  { bg: '#22c55e', text: '#ffffff' },
};
const STATUS_OPTIONS = ['Pending', 'Booked', 'In Transit', 'Delivered'];

const BASE_COLUMNS = [
  { key: 'ship_date', label: 'Ship Date' },
  { key: 'delivery_date', label: 'Delivery Date' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'city_state', label: 'City/State', sortKey: 'city' },
  { key: 'loading_building', label: 'Building' },
  { key: 'materials', label: 'Materials' },
  { key: 'po_number', label: 'PO#' },
  { key: 'carrier_name', label: 'Carrier Name' },
  { key: 'tracking_number', label: 'Tracking#' },
  { key: 'trailer_type', label: 'Trailer Type' },
  { key: 'weight', label: 'Weight' },
  { key: 'total_mileage', label: 'Total Mileage' },
  { key: 'special_instructions', label: 'Special Instructions', truncate: true },
  { key: 'status', label: 'Status' },
  { key: 'price', label: 'Price' }, // hidden in warehouse view
];

export default function ShipmentTable({
  shipments,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
  isWarehouse,
  flashedId,
  expandedId,
  onToggleExpand,
  renderActivityLog,
  getUrgencyClass,
  isHistory,    // legacy — treated as tableMode='trash'
  tableMode,    // 'active' | 'history' | 'trash'
}) {
  const effectiveMode = tableMode || (isHistory ? 'trash' : 'active');
  const COLUMNS = isWarehouse ? BASE_COLUMNS.filter(c => c.key !== 'price') : BASE_COLUMNS;

  const baseFontSize = isWarehouse ? '18px' : '14px';
  const headerFontSize = isWarehouse ? '15px' : '12px';
  const cellPadding = isWarehouse ? '14px 12px' : '9px 10px';

  return (
    <div className="animate-fade-in" style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: baseFontSize }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {/* Expand column */}
            <th style={{ ...thStyle, padding: cellPadding, fontSize: headerFontSize, width: '36px' }} />
            {COLUMNS.map(col => {
              const sortKey = col.sortKey || col.key;
              const isSorted = sortConfig.key === sortKey;
              const canSort = col.key !== 'city_state' && col.key !== 'materials' && col.key !== 'price' && col.key !== 'status';
              return (
                <th
                  key={col.key}
                  onClick={() => canSort && onSort(sortKey)}
                  style={{
                    ...thStyle,
                    padding: cellPadding,
                    fontSize: headerFontSize,
                    cursor: canSort ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    maxWidth: col.key === 'status' ? '140px' : undefined,
                    width: col.key === 'status' ? '140px' : undefined,
                  }}
                >
                  {col.label}
                  {isSorted && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              );
            })}
            {/* Actions column */}
            {!isWarehouse && (
              <th style={{ ...thStyle, padding: cellPadding, fontSize: headerFontSize, whiteSpace: 'nowrap' }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {shipments.map(shipment => {
            const isExpanded = expandedId === shipment.id;
            const urgencyClass = getUrgencyClass ? getUrgencyClass(shipment) : '';
            const isFlashed = flashedId === shipment.id;

            return (
              <TableRow
                key={shipment.id}
                shipment={shipment}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                urgencyClass={urgencyClass}
                isFlashed={isFlashed}
                isWarehouse={isWarehouse}
                effectiveMode={effectiveMode}
                showPrice={!isWarehouse}
                cellPadding={cellPadding}
                numColumns={COLUMNS.length}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onStatusChange={onStatusChange}
                renderActivityLog={renderActivityLog}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({
  shipment,
  isExpanded,
  onToggleExpand,
  urgencyClass,
  isFlashed,
  isWarehouse,
  effectiveMode,
  showPrice,
  cellPadding,
  numColumns,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
  renderActivityLog,
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const s = shipment;

  const urgencyBorderStyle = urgencyClass === 'danger'
    ? { borderLeft: '4px solid var(--accent-danger)' }
    : urgencyClass === 'warning'
      ? { borderLeft: '4px solid var(--accent-warning)' }
      : {};

  return (
    <>
      <tr
        className={isFlashed ? 'animate-row-flash' : ''}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderBottom: '1px solid var(--border)',
          background: hovered ? 'var(--bg-hover)' : 'transparent',
          transition: 'background 0.15s',
          ...urgencyBorderStyle,
        }}
      >
        {/* Expand button */}
        <td style={{ padding: cellPadding, textAlign: 'center' }}>
          <button
            onClick={() => onToggleExpand(s.id)}
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

        <Cell padding={cellPadding}>{formatDate(s.ship_date)}</Cell>
        <td style={{ padding: cellPadding, color: s.delivery_date ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: s.delivery_date ? 'normal' : 'italic', fontSize: '12px' }}>
          {s.delivery_date ? formatDate(s.delivery_date) : 'TBD'}
        </td>
        <Cell padding={cellPadding}>{s.customer_name}</Cell>
        <Cell padding={cellPadding}>{s.city}{s.state ? `, ${s.state}` : ''}</Cell>
        <Cell padding={cellPadding}>{s.loading_building || 'Building A'}</Cell>
        <MaterialsCell padding={cellPadding} shipment={s} />
        <Cell padding={cellPadding}>{s.po_number}</Cell>
        <Cell padding={cellPadding}>{s.carrier_name}</Cell>
        <Cell padding={cellPadding}>{s.tracking_number}</Cell>
        {/* Trailer Type — Hotshot shown in red */}
        <td style={{
          padding: cellPadding,
          color: s.trailer_type === 'Hotshot' ? 'var(--accent-danger)' : 'var(--text-primary)',
          fontWeight: s.trailer_type === 'Hotshot' ? 700 : 400,
          fontSize: '12px',
        }}>
          {s.trailer_type || ''}
        </td>
        <Cell padding={cellPadding}>{s.weight}</Cell>
        <Cell padding={cellPadding}>{s.total_mileage}</Cell>
        <TruncatedCell padding={cellPadding} text={s.special_instructions} />

        {/* Status — interactive dropdown in active mode, static badge otherwise */}
        <td style={{ padding: cellPadding, maxWidth: '140px', width: '140px' }}>
          {(!isWarehouse && effectiveMode === 'active') ? (
            <StatusDropdown
              currentStatus={s.status}
              onStatusChange={(newStatus) => onStatusChange(s.id, newStatus)}
            />
          ) : (
            <StatusBadge status={s.status} isWarehouse={isWarehouse} />
          )}
        </td>

        {/* Price — office view only */}
        {showPrice && (
          <td style={{ padding: cellPadding, color: 'var(--text-primary)', whiteSpace: 'nowrap', fontSize: '12px' }}>
            {s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}
          </td>
        )}

        {/* Actions */}
        {!isWarehouse && (
          <td style={{ padding: cellPadding, whiteSpace: 'nowrap' }}>
            {effectiveMode === 'trash' && (
              <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: '#22c55e' }}>Restore</button>
            )}
            {effectiveMode === 'history' && (
              <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: 'var(--accent-danger)' }}>Archive</button>
            )}
            {effectiveMode === 'active' && (
              confirmingArchive ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Move to Archive?</span>
                  <button onClick={() => setConfirmingArchive(false)} style={{ ...actionBtn, fontSize: '11px', color: 'var(--text-secondary)' }}>Cancel</button>
                  <button onClick={() => { setConfirmingArchive(false); onArchive && onArchive(s); }} style={{ ...actionBtn, fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>Confirm</button>
                </span>
              ) : (
                <span style={{ display: 'inline-flex', gap: '2px' }}>
                  <button onClick={() => onEdit(s)} style={actionBtn}>Edit</button>
                  <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: 'var(--accent-danger)' }}>Delete</button>
                  <button onClick={() => setConfirmingArchive(true)} style={{ ...actionBtn, color: 'var(--text-secondary)' }}>Archive</button>
                </span>
              )
            )}
          </td>
        )}
      </tr>

      {/* Expanded activity log */}
      {isExpanded && (
        <tr>
          <td colSpan={(numColumns || 15) + (isWarehouse ? 1 : 2)} style={{
            padding: '0 24px 16px 56px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}>
            {renderActivityLog && renderActivityLog(s.id)}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Inline Status Dropdown ─────────────────────────────────────────
function StatusDropdown({ currentStatus, onStatusChange }) {
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Sync if external status changes (e.g. realtime update)
  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  // Click outside → close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const colors = STATUS_COLORS_DROPDOWN[localStatus] || STATUS_COLORS_DROPDOWN['Pending'];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Badge button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          background: colors.bg,
          color: colors.text,
          border: 'none',
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: '110px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
      >
        {localStatus}
        <span style={{ fontSize: '9px', opacity: 0.8 }}>▾</span>
      </button>

      {/* Dropdown popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 200,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '6px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
          minWidth: '140px',
        }}>
          {STATUS_OPTIONS.map(status => {
            const sc = STATUS_COLORS_DROPDOWN[status];
            const isCurrent = status === localStatus;
            return (
              <button
                key={status}
                onClick={async () => {
                  setIsOpen(false);
                  if (status !== localStatus) {
                    const prev = localStatus;
                    setLocalStatus(status);        // optimistic update
                    try {
                      await onStatusChange(status);
                    } catch (err) {
                      console.error('Status update failed:', err?.message);
                      setLocalStatus(prev);        // revert on error
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  marginBottom: '2px',
                  background: isCurrent ? sc.bg : 'transparent',
                  border: isCurrent ? 'none' : `1px solid transparent`,
                  borderRadius: '7px',
                  color: isCurrent ? sc.text : 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: sc.bg,
                  flexShrink: 0,
                }} />
                {status}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helper cells ───────────────────────────────────────────────────
function MaterialsCell({ shipment, padding }) {
  const items = shipment.shipment_materials && shipment.shipment_materials.length > 0
    ? shipment.shipment_materials
    : shipment.material
      ? [{ quantity: shipment.quantity != null ? String(shipment.quantity) : '', material_name: shipment.material }]
      : [];

  if (items.length === 0) return <td style={{ padding, color: 'var(--text-primary)' }} />;

  return (
    <td style={{ padding, color: 'var(--text-primary)', maxWidth: '200px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((m, i) => (
          <span key={i} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }}>
            {m.quantity ? `${m.quantity} ` : ''}{m.material_name}
          </span>
        ))}
      </div>
    </td>
  );
}

function Cell({ children, padding }) {
  return <td style={{ padding, color: 'var(--text-primary)', fontSize: '12px' }}>{children ?? ''}</td>;
}

function TruncatedCell({ text, padding }) {
  const truncated = truncateText(text, 50);
  const needsTooltip = text && text.length > 50;
  return (
    <td style={{ padding, color: 'var(--text-primary)', maxWidth: '180px', fontSize: '12px' }} title={needsTooltip ? text : undefined}>
      {truncated}
    </td>
  );
}

const thStyle = {
  textAlign: 'left',
  fontFamily: 'var(--font-heading), Oswald, sans-serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-secondary)',
  background: 'var(--bg-surface)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const actionBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--accent-green)',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 6px',
};
