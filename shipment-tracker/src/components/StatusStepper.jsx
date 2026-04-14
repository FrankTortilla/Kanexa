'use client';
import { STATUS_LIST, STATUS_COLORS } from '../lib/constants';

export default function StatusStepper({ currentStatus, onStatusChange }) {
  const currentIndex = STATUS_LIST.indexOf(currentStatus);

  const nextStatus = currentIndex < STATUS_LIST.length - 1
    ? STATUS_LIST[currentIndex + 1]
    : null;

  if (!nextStatus) return null;

  const colors = STATUS_COLORS[nextStatus];

  return (
    <button
      onClick={() => onStatusChange(nextStatus)}
      title={`Mark as ${nextStatus}`}
      style={{
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font-heading), Oswald, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: `1px solid ${colors.bg}`,
        background: 'transparent',
        color: colors.bg,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      → {nextStatus}
    </button>
  );
}
