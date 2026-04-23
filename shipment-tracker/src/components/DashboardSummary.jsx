'use client';

export default function DashboardSummary({ shipments, isWarehouse, onCardClick }) {
  const pending   = shipments.filter(s => s.status === 'Pending').length;
  const booked    = shipments.filter(s => s.status === 'Booked').length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const total     = shipments.filter(s => s.status !== 'Delivered').length;

  const fontSize  = isWarehouse ? '32px' : '24px';
  const labelSize = isWarehouse ? '14px' : '12px';

  const cards = isWarehouse
    ? [
        { key: 'pending',    label: 'Pending',    value: pending,   color: 'var(--accent-pending)',    glow: 'var(--accent-pending-glow)'    },
        { key: 'booked',     label: 'Booked',     value: booked,    color: 'var(--accent-booked)',     glow: 'var(--accent-booked-glow)'     },
        { key: 'in-transit', label: 'In Transit', value: inTransit, color: 'var(--accent-in-transit)', glow: 'var(--accent-in-transit-glow)' },
        { key: 'delivered',  label: 'Delivered',  value: delivered, color: 'var(--accent-delivered)',  glow: 'var(--accent-delivered-glow)'  },
      ]
    : [
        { key: 'pending',    label: 'Pending',      value: pending,   color: 'var(--accent-pending)',    glow: 'var(--accent-pending-glow)'    },
        { key: 'booked',     label: 'Booked',       value: booked,    color: 'var(--accent-booked)',     glow: 'var(--accent-booked-glow)'     },
        { key: 'in-transit', label: 'In Transit',   value: inTransit, color: 'var(--accent-in-transit)', glow: 'var(--accent-in-transit-glow)' },
        { key: 'delivered',  label: 'Delivered',    value: delivered, color: 'var(--accent-delivered)',  glow: 'var(--accent-delivered-glow)'  },
        { key: 'total',      label: 'Total Active', value: total,     color: 'var(--text-primary)',      glow: 'transparent'                   },
      ];

  return (
    <div className="no-print summary-cards-scroll" style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 24px',
      background: '#363636',
      borderBottom: '1px solid #2a2a2a',
    }}>
      {cards.map(card => (
        <div
          key={card.key}
          onClick={() => onCardClick && onCardClick(card.key)}
          style={{
            flex: '1 1 120px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#1E293B',
            border: '1px solid var(--border)',
            boxShadow: `0 0 12px ${card.glow}`,
            minWidth: '110px',
            cursor: onCardClick ? 'pointer' : 'default',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            if (!onCardClick) return;
            e.currentTarget.style.borderColor = card.color;
            e.currentTarget.style.boxShadow = `0 0 16px ${card.glow}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = `0 0 12px ${card.glow}`;
          }}
        >
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
