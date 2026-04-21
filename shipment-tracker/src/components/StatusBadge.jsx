'use client';
import { STATUS_COLORS, BADGE_COLORS } from '../lib/constants';

export default function StatusBadge({ status, isWarehouse }) {
  if (isWarehouse) {
    // Warehouse: dark/colored bg, white text, glow — large size
    const colors = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
    return (
      <span
        style={{
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
        }}
      >
        {status}
      </span>
    );
  }

  // Office: light bg, dark text — pill style
  const colors = BADGE_COLORS[status] || BADGE_COLORS['Pending'];
  const isPending = status === 'Pending';

  return (
    <span
      className={isPending ? 'animate-pending-pulse' : ''}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
