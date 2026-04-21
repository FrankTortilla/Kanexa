'use client';
import { useState, useMemo, useCallback } from 'react';
import { useShipments } from '../../hooks/useShipments';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../lib/constants';
import LiveIndicator from '../../components/LiveIndicator';

const STATUS_ORDER = { 'Pending': 0, 'Booked': 1, 'In Transit': 2, 'Delivered': 3 };

export default function WarehousePage() {
  const {
    shipments, allShipments, loading, flashedId, fetchShipments,
  } = useShipments();

  const [expandedId, setExpandedId] = useState(null);

  // Sort: Pending first, then Shipped, then Delivered
  const sorted = useMemo(() => {
    return [...shipments].sort((a, b) => {
      const diff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (diff !== 0) return diff;
      return new Date(b.ship_date) - new Date(a.ship_date);
    });
  }, [shipments]);

  const pending    = allShipments.filter(s => s.status === 'Pending').length;
  const booked     = allShipments.filter(s => s.status === 'Booked').length;
  const inTransit  = allShipments.filter(s => s.status === 'In Transit').length;
  const delivered  = allShipments.filter(s => s.status === 'Delivered').length;

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#1a1a1a', color: '#a0a0a0',
        fontSize: '32px', fontFamily: 'Oswald, sans-serif',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#ffffff', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo-icon.svg" alt="GS" style={{ height: '56px' }} />
          <h1 style={{
            fontFamily: 'Oswald, sans-serif', fontSize: '42px', fontWeight: 700,
            margin: 0, letterSpacing: '1px',
          }}>
            SHIPMENT TRACKER
          </h1>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <SummaryCard label="PENDING"    value={pending}   color="#e6b800" />
        <SummaryCard label="BOOKED"     value={booked}    color="#3b82f6" />
        <SummaryCard label="IN TRANSIT" value={inTransit} color="#f97316" />
        <SummaryCard label="DELIVERED"  value={delivered} color="#4a7c3f" />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '3px solid #333' }}>
              {['Status', 'Ship Date', 'Customer', 'City/State', 'Materials', 'PO#', 'Carrier', 'Tracking#', 'Trailer Type', 'Building'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontFamily: 'Oswald, sans-serif', fontSize: '18px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '1px', color: '#a0a0a0',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => {
              const colors = STATUS_COLORS[s.status];
              const isFlashed = flashedId === s.id;
              return (
                <tr
                  key={s.id}
                  className={isFlashed ? 'animate-row-flash' : ''}
                  style={{
                    borderBottom: '1px solid #333',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '22px',
                      fontWeight: 700,
                      fontFamily: 'Oswald, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: colors.bg,
                      color: colors.text,
                      boxShadow: `0 0 16px ${colors.glow}`,
                      minWidth: '140px',
                      textAlign: 'center',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <WarehouseCell>{formatDate(s.ship_date)}</WarehouseCell>
                  <WarehouseCell bold>{s.customer_name}</WarehouseCell>
                  <WarehouseCell>{s.city}{s.state ? `, ${s.state}` : ''}</WarehouseCell>
                  <MaterialsCell shipment={s} />
                  <WarehouseCell>{s.po_number}</WarehouseCell>
                  <WarehouseCell>{s.carrier_name}</WarehouseCell>
                  <WarehouseCell>{s.tracking_number}</WarehouseCell>
                  <TrailerTypeCell trailerType={s.trailer_type} />
                  <WarehouseCell>{s.loading_building || 'Building A'}</WarehouseCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 24px', color: '#a0a0a0',
          fontFamily: 'Oswald, sans-serif', fontSize: '28px',
        }}>
          NO ACTIVE SHIPMENTS
        </div>
      )}

      <LiveIndicator isWarehouse={true} onFallbackRefetch={fetchShipments} />
    </div>
  );
}

function WarehouseCell({ children, bold }) {
  return (
    <td style={{
      padding: '16px',
      fontSize: '20px',
      fontWeight: bold ? 700 : 400,
      color: '#ffffff',
      whiteSpace: 'nowrap',
    }}>
      {children ?? ''}
    </td>
  );
}

function MaterialsCell({ shipment }) {
  const items = shipment.shipment_materials && shipment.shipment_materials.length > 0
    ? shipment.shipment_materials
    : shipment.material
      ? [{ quantity: shipment.quantity != null ? String(shipment.quantity) : '', material_name: shipment.material }]
      : [];
  return (
    <td style={{ padding: '16px', fontSize: '20px', color: '#ffffff', maxWidth: '260px' }}>
      {items.map((m, i) => (
        <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.quantity ? `${m.quantity} ` : ''}{m.material_name}
        </div>
      ))}
    </td>
  );
}

function TrailerTypeCell({ trailerType }) {
  const isHotshot = trailerType === 'Hotshot';
  return (
    <td style={{
      padding: '16px',
      fontSize: '20px',
      fontWeight: isHotshot ? 700 : 400,
      color: isHotshot ? '#ff4444' : '#ffffff',
      whiteSpace: 'nowrap',
    }}>
      {trailerType || ''}
    </td>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      flex: '1 1 200px',
      padding: '20px 24px',
      borderRadius: '12px',
      background: '#242424',
      border: `2px solid ${color}40`,
      minWidth: '180px',
    }}>
      <div style={{
        fontSize: '48px', fontWeight: 700,
        fontFamily: 'Oswald, sans-serif',
        color, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '16px', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '2px',
        color: '#a0a0a0', marginTop: '4px',
      }}>
        {label}
      </div>
    </div>
  );
}
