'use client';
import { STATUS_COLORS } from '../lib/constants';

export default function StatusBadge({ status, isWarehouse }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
  const isPending = status === 'Pending';
  const size = isWarehouse ? '16px' : '13px';

  return (
    <span
      className={isPending ? 'animate-pending-pulse' : ''}
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: size,
        fontWeight: 700,
        fontFamily: 'var(--font-heading), Oswald, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: colors.bg,
        color: colors.text,
        boxShadow: `0 0 8px ${colors.glow}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
