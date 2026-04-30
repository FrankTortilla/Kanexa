'use client';
import { STATUS_BADGE_COLORS } from '../lib/constants';

export default function StatusBadge({ status }) {
  const colors = STATUS_BADGE_COLORS[status] || { bg: '#6b7280', text: '#ffffff' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      background: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
      minWidth: '108px',
      textAlign: 'center',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  );
}
