'use client';

export default function DashboardSummary({ shipments, isWarehouse }) {
  const now = new Date();

  // Start of current calendar week (Monday 00:00 local)
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, …
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartISO = weekStart.toISOString();

  const pending   = shipments.filter(s => s.status === 'Pending').length;
  const booked    = shipments.filter(s => s.status === 'Booked').length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const inMotion  = booked + inTransit;   // Booked + In Transit combined

  const deliveredWeek = shipments.filter(s =>
    s.status === 'Delivered' && s.updated_at && s.updated_at >= weekStartISO
  ).length;

  const totalActive = shipments.length;

  const fontSize  = isWarehouse ? '32px' : '24px';
  const labelSize = isWarehouse ? '14px' : '12px';

  const cards = isWarehouse
    ? [
        { label: 'Pending',             value: pending,      color: 'var(--accent-pending)',    glow: 'var(--accent-pending-glow)'    },
        { label: 'Booked',              value: booked,       color: 'var(--accent-booked)',     glow: 'var(--accent-booked-glow)'     },
        { label: 'In Transit',          value: inTransit,    color: 'var(--accent-in-transit)', glow: 'var(--accent-in-transit-glow)' },
        { label: 'Delivered This Week', value: deliveredWeek,color: 'var(--accent-delivered)',  glow: 'var(--accent-delivered-glow)'  },
      ]
    : [
        { label: 'Pending',             value: pending,      color: 'var(--accent-pending)',    glow: 'var(--accent-pending-glow)'    },
        { label: 'In Transit',          value: inMotion,     color: 'var(--accent-in-transit)', glow: 'var(--accent-in-transit-glow)' },
        { label: 'Delivered This Week', value: deliveredWeek,color: 'var(--accent-delivered)',  glow: 'var(--accent-delivered-glow)'  },
        { label: 'Total Active',        value: totalActive,  color: 'var(--text-primary)',      glow: 'transparent'                   },
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
