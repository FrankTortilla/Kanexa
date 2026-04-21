'use client';

export default function Header({ onAddShipment, onPrint, onExport, isWarehouse, activeTab, onTabChange }) {
  return (
    <header className="no-print" style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo-icon.svg"
          alt="Green Steel"
          style={{ height: '36px', width: 'auto' }}
        />
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading), Oswald, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: '0.5px',
            lineHeight: 1.1,
          }}>
            Shipment Tracker
          </h1>
          <span style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            Green Steel Manufacturing
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {[
            { key: 'active',    label: 'Active'    },
            { key: 'delivered', label: 'Delivered' },
            { key: 'history',   label: 'History'   },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--accent-green)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button onClick={onExport} style={btnStyle}>Export CSV</button>
        <button onClick={onPrint} style={btnStyle}>Print</button>

        {!isWarehouse && (
          <button onClick={onAddShipment} style={{
            ...btnStyle,
            background: 'var(--accent-green)',
            border: '1px solid var(--accent-green)',
            color: '#fff',
            fontWeight: 700,
          }}>
            + Add Shipment
          </button>
        )}
      </div>
    </header>
  );
}

const btnStyle = {
  padding: '7px 14px',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};
