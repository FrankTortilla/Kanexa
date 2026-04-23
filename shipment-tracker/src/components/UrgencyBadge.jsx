'use client';

/**
 * Returns urgency level for a shipment: 'danger' (48h+), 'warning' (24-48h), or null.
 */
export function getUrgencyLevel(shipment) {
  if (shipment.status !== 'Pending') return null;
  const created = new Date(shipment.created_at);
  const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  if (hoursElapsed >= 48) return 'danger';
  if (hoursElapsed >= 24) return 'warning';
  return null;
}

/**
 * Returns the overdue text like "⚠ 3d overdue"
 */
function getOverdueText(shipment) {
  const created = new Date(shipment.created_at);
  const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  const days = Math.floor(hoursElapsed / 24);
  return `⚠ ${days}d overdue`;
}

export default function UrgencyBadge({ shipment }) {
  const level = getUrgencyLevel(shipment);
  if (level !== 'danger') return null;

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 700,
      color: 'var(--accent-danger)',
      background: 'var(--accent-danger-glow)',
      padding: '2px 8px',
      borderRadius: '4px',
      marginLeft: '6px',
      whiteSpace: 'nowrap',
    }}>
      {getOverdueText(shipment)}
    </span>
  );
}
