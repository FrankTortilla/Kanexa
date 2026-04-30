'use client';

export default function DashboardSummary({ orders }) {
  // Excludes cancelled and archived
  const active = orders.filter(o => o.status !== 'Cancelled' && !o.archived);
  const totalQty = active.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalLF = active.reduce((sum, o) => sum + (o.total_lf || 0), 0);

  const tiles = [
    { label: 'Total Qty', value: totalQty.toLocaleString(), unit: 'ea' },
    { label: 'Total LF', value: totalLF.toLocaleString(), unit: 'lf' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '16px 24px',
      background: '#363636',
      borderBottom: '1px solid var(--border)',
    }}>
      {tiles.map(({ label, value, unit }) => (
        <div
          key={label}
          style={{
            background: '#1E293B',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 24px',
            minWidth: '160px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            {label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{
              fontFamily: 'var(--font-heading), Oswald, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--accent-green)',
              lineHeight: 1,
            }}>
              {value}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
