'use client';
import { STATUS_LIST, BADGE_COLORS } from '../lib/constants';

export default function StatusStepper({ currentStatus, onStatusChange }) {
  const currentIndex = STATUS_LIST.indexOf(currentStatus);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
      {STATUS_LIST.map((status, i) => {
        const isCurrent = i === currentIndex;
        const isNext    = i === currentIndex + 1;
        const isPast    = i < currentIndex;
        const colors    = BADGE_COLORS[status] || BADGE_COLORS['Pending'];

        return (
          <span key={status} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: '9px',
                opacity: 0.4,
                margin: '0 2px',
                userSelect: 'none',
              }}>›</span>
            )}
            <button
              onClick={isNext ? () => onStatusChange(status) : undefined}
              disabled={!isNext}
              title={isNext ? `Advance to ${status}` : status}
              style={{
                padding: '2px 7px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: isCurrent ? 700 : 500,
                background: isCurrent ? colors.bg : 'transparent',
                color: isCurrent
                  ? colors.text
                  : isNext
                    ? colors.text
                    : 'var(--text-secondary)',
                border: isNext ? `1px solid ${colors.bg}` : 'none',
                cursor: isNext ? 'pointer' : 'default',
                opacity: isPast ? 0.35 : 1,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                lineHeight: '1.4',
              }}
            >
              {status}
            </button>
          </span>
        );
      })}
    </div>
  );
}
