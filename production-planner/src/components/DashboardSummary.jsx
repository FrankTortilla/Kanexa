'use client';

const STATUS_TILES = [
  { key: 'In Production', label: 'IN PRODUCTION', color: '#38BDF8' },
  { key: 'Ready to Ship', label: 'READY TO SHIP', color: '#00E676' },
  { key: 'Delayed',       label: 'DELAYED',        color: '#FF8C00' },
  { key: 'On Hold',       label: 'ON HOLD',         color: '#FFD700' },
];

export default function DashboardSummary({ orders }) {
  const active = orders.filter(o => o.status !== 'Cancelled' && !o.archived);
  const totalQty = active.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalLF  = active.reduce((sum, o) => sum + (o.total_lf  || 0), 0);

  const statusCounts = STATUS_TILES.map(t => ({
    ...t,
    count: active.filter(o => o.status === t.key).length,
  }));

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '16px 24px',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid #333333',
    }}>
      {statusCounts.map(({ key, label, color, count }) => (
        <Tile key={key} label={label} value={count} valueColor={color} />
      ))}

      <Tile label="TOTAL ACTIVE" value={active.length} valueColor="#ffffff" />

      <div style={{ width: '1px', background: '#333333', margin: '4px 4px', alignSelf: 'stretch' }} />

      <Tile label="TOTAL QTY" value={totalQty.toLocaleString()} valueColor="#ffffff" unit="ea" />
      <Tile label="TOTAL LF"  value={totalLF.toLocaleString()}  valueColor="#ffffff" unit="lf" />
    </div>
  );
}

function Tile({ label, value, valueColor, unit }) {
  return (
    <div style={{
      background: '#2a2a2a',
      border: '1px solid #333333',
      borderRadius: '8px',
      padding: '14px 20px',
      minWidth: '120px',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading), Oswald, sans-serif',
        fontSize: '32px',
        fontWeight: 700,
        color: valueColor,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: '5px',
      }}>
        {value}
        {unit && <span style={{ fontSize: '13px', color: '#888888', fontWeight: 600 }}>{unit}</span>}
      </div>
      <div style={{
        fontSize: '10px',
        color: '#888888',
        fontWeight: 700,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        marginTop: '5px',
      }}>
        {label}
      </div>
    </div>
  );
}
