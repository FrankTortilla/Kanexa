'use client';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function DashboardSummary({ orders, activeTab, statusFilter, onStatusFilter }) {
  const tabOrders = orders.filter(o => o.order_type === activeTab && !o.archived && o.status !== 'Cancelled');

  const inProduction = tabOrders.filter(o => o.status === 'In Production').length;
  const readyToShip  = tabOrders.filter(o => o.status === 'Ready to Ship').length;
  const delayed      = tabOrders.filter(o => o.status === 'Delayed').length;
  const onHold       = tabOrders.filter(o => o.status === 'On Hold').length;
  const totalActive  = tabOrders.length;

  // Metric tiles scoped to active tab
  const totalQty = tabOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalLF  = tabOrders.reduce((sum, o) => sum + (o.total_lf || 0), 0);

  const statusCards = [
    { key: 'In Production', label: 'In Production', value: inProduction, color: '#3b82f6', glow: 'rgba(59,130,246,0.25)', labelColor: '#3b82f6' },
    { key: 'Ready to Ship', label: 'Ready to Ship', value: readyToShip,  color: '#22c55e', glow: 'rgba(22,197,94,0.25)'  },
    { key: 'Delayed',       label: 'Delayed',       value: delayed,      color: '#e6b800', glow: 'rgba(230,184,0,0.15)'  },
    { key: 'On Hold',       label: 'On Hold',       value: onHold,       color: '#FF8C00', glow: 'rgba(255,140,0,0.25)'  },
    { key: 'total',         label: 'Total Active',  value: totalActive,  color: 'var(--text-primary)', glow: 'transparent' },
  ];

  // Total LF is only meaningful for Baskets (Loose Dowels and EpoxyFab don't use LF)
  const showTotalLF = activeTab === 'Baskets';

  const metricCards = [
    { key: 'total-qty', label: 'Total QTY', value: numberFormatter.format(totalQty) + ' ea', color: '#B8C7D9' },
    ...(showTotalLF ? [{ key: 'total-lf', label: 'Total LF', value: numberFormatter.format(totalLF) + ' lf', color: '#96ba94' }] : []),
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
      {statusCards.map(card => {
        const isSelected = statusFilter === card.key;
        return (
          <div
            key={card.key}
            onClick={() => onStatusFilter(isSelected ? null : card.key)}
            style={{
              flex: '1 1 110px',
              minWidth: '100px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#1a1a1a',
              border: isSelected ? `2px solid ${card.color === 'var(--text-primary)' ? '#cbd5e1' : card.color}` : '1px solid var(--border)',
              boxShadow: isSelected ? `0 0 16px ${card.glow}` : `0 0 12px ${card.glow}`,
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s, filter 0.15s',
              filter: isSelected ? 'brightness(1.15)' : 'brightness(1)',
              userSelect: 'none',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.filter = 'brightness(1)'; }}
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
              color: card.labelColor || 'var(--text-secondary)',
              textShadow: card.labelGlow || 'none',
              marginTop: '4px',
            }}>
              {card.label}
            </div>
          </div>
        );
      })}

      <div style={{
        width: '1px',
        alignSelf: 'stretch',
        background: 'rgba(255,255,255,0.1)',
        margin: '0 4px',
        flexShrink: 0,
      }} />

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
