'use client';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function DashboardSummary({ orders }) {
  const active = orders.filter(o => o.status !== 'Cancelled' && !o.archived);

  const inProduction = active.filter(o => o.status === 'In Production').length;
  const readyToShip  = active.filter(o => o.status === 'Ready to Ship').length;
  const delayed      = active.filter(o => o.status === 'Delayed').length;
  const onHold       = active.filter(o => o.status === 'On Hold').length;
  const totalActive  = active.length;
  const totalQty     = active.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalLF      = active.reduce((sum, o) => sum + (o.total_lf || 0), 0);

  const statusCards = [
    { key: 'in-production', label: 'In Production', value: inProduction, color: '#2563eb',  glow: 'rgba(37, 99, 235, 0.25)'   },
    { key: 'ready-to-ship', label: 'Ready to Ship', value: readyToShip,  color: '#16a34a',  glow: 'rgba(22, 163, 74, 0.25)'   },
    { key: 'delayed',       label: 'Delayed',       value: delayed,      color: '#FF8C00',  glow: 'rgba(255, 140, 0, 0.25)'   },
    { key: 'on-hold',       label: 'On Hold',       value: onHold,       color: '#ca8a04',  glow: 'rgba(202, 138, 4, 0.25)'   },
    { key: 'total',         label: 'Total Active',  value: totalActive,  color: 'var(--text-primary)', glow: 'transparent' },
  ];

  const metricCards = [
    { key: 'total-qty', label: 'Total QTY', value: numberFormatter.format(totalQty) + ' ea', color: '#B8C7D9' },
    { key: 'total-lf',  label: 'Total LF',  value: numberFormatter.format(totalLF)  + ' lf', color: '#96ba94' },
  ];

  return (
    <div className="no-print summary-cards-scroll" style={{
      display: 'flex',
      alignItems: 'stretch',
      gap: '12px',
      padding: '12px 24px',
      background: '#363636',
      borderBottom: '1px solid #2a2a2a',
    }}>
      {/* Status count tiles */}
      {statusCards.map(card => (
        <div
          key={card.key}
          style={{
            flex: '1 1 110px',
            minWidth: '100px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#1a1a1a',
            border: '1px solid var(--border)',
            boxShadow: `0 0 12px ${card.glow}`,
            cursor: 'default',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        >
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading), Oswald, sans-serif',
            color: card.color,
            lineHeight: 1.1,
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '12px',
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

      {/* Separator */}
      <div style={{
        width: '1px',
        alignSelf: 'stretch',
        background: 'rgba(255,255,255,0.1)',
        margin: '0 4px',
        flexShrink: 0,
      }} />

      {/* Metric tiles */}
      {metricCards.map(card => (
        <div
          key={card.key}
          style={{
            flex: '1.2 1 140px',
            minWidth: '130px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.07)',
            cursor: 'default',
          }}
        >
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading), Oswald, sans-serif',
            color: card.color,
            lineHeight: 1.1,
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '12px',
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
