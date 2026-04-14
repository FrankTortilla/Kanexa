'use client';

export default function DashboardSummary({ shipments, isWarehouse }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const pending = shipments.filter(s => s.status === 'Pending').length;
  const shippedToday = shipments.filter(s => s.status === 'Shipped' && s.updated_at && s.updated_at.slice(0, 10) === todayStr).length;
  const deliveredWeek = shipments.filter(s => s.status === 'Delivered' && s.updated_at && s.updated_at >= weekAgo).length;
  const totalActive = shipments.length;

  const fontSize = isWarehouse ? '32px' : '24px';
  const labelSize = isWarehouse ? '14px' : '12px';

  const cards = [
    { label: 'Pending', value: pending, color: 'var(--accent-pending)', glow: 'var(--accent-pending-glow)' },
    { label: 'Shipped Today', value: shippedToday, color: 'var(--accent-shipped)', glow: 'var(--accent-shipped-glow)' },
    { label: 'Delivered This Week', value: deliveredWeek, color: 'var(--accent-delivered)', glow: 'var(--accent-delivered-glow)' },
    { label: 'Total Active', value: totalActive, color: 'var(--text-primary)', glow: 'transparent' },
  ];

  return (
    <div className="no-print" style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      {cards.map(card => (
        <div key={card.label} style={{
          flex: '1 1 150px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          boxShadow: `0 0 12px ${card.glow}`,
          minWidth: '120px',
        }}>
          <div style={{
            fontSize,
            fontWeight: 700,
            fontFamily: 'var(--font-heading), Oswald, sans-serif',
            color: card.color,
            lineHeight: 1.1,
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: labelSize,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-secondary)',
            marginTop: '4px',
          }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
