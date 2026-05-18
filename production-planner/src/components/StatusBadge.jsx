'use client';
import { STATUS_BADGE_COLORS } from '../lib/constants';

export default function StatusBadge({ status }) {
  const colors = STATUS_BADGE_COLORS[status] || { bg: '#6b7280', text: '#ffffff' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
      textShadow: colors.textShadow || 'none',
      whiteSpace: 'nowrap',
      minWidth: '110px',
      textAlign: 'center',
    }}>
      {status}
    </span>
  );
}
