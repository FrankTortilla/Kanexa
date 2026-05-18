'use client';

export default function EmptyState({ onAdd, tabLabel, isHistory, hasFilter }) {
  if (isHistory) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', color: 'var(--text-secondary)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>🗄</div>
        <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          No archived {tabLabel} orders
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Archived and cancelled orders will appear here.
        </p>
      </div>
    );
  }

  if (hasFilter) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', color: 'var(--text-secondary)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>🔍</div>
        <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          No orders match this filter
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Click the stat card again to clear the filter.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', color: 'var(--text-secondary)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>📋</div>
      <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
        No {tabLabel} orders
      </p>
      <p style={{ fontSize: '14px', margin: '0 0 24px' }}>
        Get started by adding the first production order.
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            padding: '10px 24px', background: 'var(--accent-green)', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Add Order
        </button>
      )}
    </div>
  );
}
