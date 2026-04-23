'use client';

export default function EmptyState({ isWarehouse }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      color: 'var(--text-secondary)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
      <h2 style={{
        fontFamily: 'var(--font-heading), Oswald, sans-serif',
        fontSize: '24px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: '0 0 8px',
      }}>
        No shipments yet
      </h2>
      <p style={{ fontSize: '16px', margin: 0 }}>
        {isWarehouse
          ? 'Waiting for shipments to appear...'
          : 'Click "Add Shipment" to get started.'}
      </p>
    </div>
  );
}
