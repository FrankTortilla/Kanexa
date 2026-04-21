'use client';
import { STATUS_LIST } from '../lib/constants';

export default function SearchFilterBar({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  totalCount, filteredCount,
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
          return (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              style={{
                padding: '7px 14px',
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
            </button>
          );
        })}
      </div>

      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        Showing {filteredCount} of {totalCount}
      </span>
    </div>
  );
}
