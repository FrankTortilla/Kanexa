'use client';
import { STATUS_COLORS, BADGE_COLORS } from '../lib/constants';

export default function StatusBadge({ status, isWarehouse }) {
  if (isWarehouse) {
    // Warehouse: large dark-bg badge with glow
    const colors = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
    return (
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
        {status}
      </span>
    );
  }

  // Office: solid-color pill
  const colors = BADGE_COLORS[status] || BADGE_COLORS['Pending'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
      minWidth: '110px',
      textAlign: 'center',
    }}>
      {status}
    </span>
  );
}
