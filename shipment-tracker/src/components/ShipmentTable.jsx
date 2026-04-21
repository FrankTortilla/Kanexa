'use client';
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import StatusStepper from './StatusStepper';
import { formatDate, truncateText } from '../utils/formatters';

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

  const baseFontSize = isWarehouse ? '18px' : '15px';
  const headerFontSize = isWarehouse ? '15px' : '12px';
  const cellPadding = isWarehouse ? '14px 12px' : '10px 10px';

  return (
    <div className="animate-fade-in" style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: baseFontSize }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {/* Expand column */}
            <th style={{ ...thStyle, padding: cellPadding, fontSize: headerFontSize, width: '40px' }} />
            {COLUMNS.map(col => {
              const sortKey = col.sortKey || col.key;
              const isSorted = sortConfig.key === sortKey;
              const canSort = col.key !== 'city_state' && col.key !== 'materials' && col.key !== 'price';
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
            {!isWarehouse && <th style={{ ...thStyle, padding: cellPadding, fontSize: headerFontSize }}>Actions</th>}
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
              fontSize: '14px',
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            ▶
          </button>
        </td>

        <Cell padding={cellPadding}>{formatDate(s.ship_date)}</Cell>
        <td style={{ padding: cellPadding, color: s.delivery_date ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: s.delivery_date ? 'normal' : 'italic' }}>
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
        }}>
          {s.trailer_type || ''}
        </td>
        <Cell padding={cellPadding}>{s.weight}</Cell>
        <Cell padding={cellPadding}>{s.total_mileage}</Cell>
        <TruncatedCell padding={cellPadding} text={s.special_instructions} />
        <td style={{ padding: cellPadding }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={s.status} isWarehouse={isWarehouse} />
            {!isWarehouse && effectiveMode === 'active' && (
              <StatusStepper currentStatus={s.status} onStatusChange={(newStatus) => onStatusChange(s.id, newStatus)} />
            )}
          </div>
        </td>
        {/* Price — office view only */}
        {showPrice && (
          <td style={{ padding: cellPadding, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}
          </td>
        )}

        {!isWarehouse && (
          <td style={{ padding: cellPadding, whiteSpace: 'nowrap' }}>
            {effectiveMode === 'trash' && (
              <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: 'var(--accent-delivered)' }}>Restore</button>
            )}
            {effectiveMode === 'history' && (
              <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: 'var(--accent-danger)' }}>Archive</button>
            )}
            {effectiveMode === 'active' && (
              confirmingArchive ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Move to Archive?</span>
                  <button
                    onClick={() => setConfirmingArchive(false)}
                    style={{ ...actionBtn, color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmingArchive(false); onArchive && onArchive(s); }}
                    style={{ ...actionBtn, color: 'var(--accent-delivered)', fontWeight: 700 }}
                  >
                    Confirm
                  </button>
                </span>
              ) : (
                <>
                  <button onClick={() => onEdit(s)} style={actionBtn}>Edit</button>
                  <button onClick={() => onDelete(s)} style={{ ...actionBtn, color: 'var(--accent-danger)' }}>Delete</button>
                  <button onClick={() => setConfirmingArchive(true)} style={{ ...actionBtn, color: 'var(--text-secondary)' }}>Archive</button>
                </>
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

function MaterialsCell({ shipment, padding }) {
  const items = shipment.shipment_materials && shipment.shipment_materials.length > 0
    ? shipment.shipment_materials
    : shipment.material
      ? [{ quantity: shipment.quantity != null ? String(shipment.quantity) : '', material_name: shipment.material }]
      : [];

  if (items.length === 0) return <td style={{ padding, color: 'var(--text-primary)' }} />;

  return (
    <td style={{ padding, color: 'var(--text-primary)', maxWidth: '220px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((m, i) => (
          <span key={i} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {m.quantity ? `${m.quantity} ` : ''}{m.material_name}
          </span>
        ))}
      </div>
    </td>
  );
}

function Cell({ children, padding }) {
  return <td style={{ padding, color: 'var(--text-primary)' }}>{children ?? ''}</td>;
}

function TruncatedCell({ text, padding }) {
  const truncated = truncateText(text, 50);
  const needsTooltip = text && text.length > 50;
  return (
    <td style={{ padding, color: 'var(--text-primary)', maxWidth: '200px' }} title={needsTooltip ? text : undefined}>
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
  fontSize: '13px',
  fontWeight: 600,
  padding: '4px 8px',
};
