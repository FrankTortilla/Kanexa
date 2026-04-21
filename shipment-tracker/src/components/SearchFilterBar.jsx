'use client';

export default function SearchFilterBar({
  searchQuery, onSearchChange,
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

      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {filteredCount} shipment{filteredCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
