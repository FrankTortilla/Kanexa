'use client';
import { STATUS_LIST, BADGE_COLORS } from '../lib/constants';

export default function SearchFilterBar({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  totalCount, filteredCount,
  statusCounts,
  isWarehouse,
}) {
  const fontSize = isWarehouse ? '18px' : '15px';

  return (
    <div className="no-print" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      <input
        type="text"
        placeholder="Search shipments..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        style={{
          flex: '1 1 250px',
          padding: '10px 14px',
          fontSize,
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
          minWidth: '200px',
        }}
      />

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {STATUS_LIST.map(status => {
          const isActive = statusFilter === status;
          const badgeColors = BADGE_COLORS[status];
          const count = statusCounts ? (statusCounts[status] ?? 0) : null;

          return (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading), Oswald, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: '6px',
                border: isActive ? '2px solid var(--accent-green)' : '1px solid var(--border)',
                background: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {status}
              {count !== null && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 5px',
                  borderRadius: '9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: badgeColors.bg,
                  color: badgeColors.text,
                  fontFamily: 'var(--font-body), sans-serif',
                  textTransform: 'none',
                  letterSpacing: 0,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        Showing {filteredCount} of {totalCount} shipments
      </span>
    </div>
  );
}
