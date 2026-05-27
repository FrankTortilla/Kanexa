'use client';

export default function Header({ onAddShipment, onPrint, onExport, isWarehouse, activeTab, onTabChange }) {
  return (
    <header className="no-print" style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Row 1: Logo + Actions */}
      <div style={{
        height: '125px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <img
          src="/GS-Grey-Logo.png"
          alt="SureBuilT"
          style={{ height: '70px', width: 'auto' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onExport} style={btnStyle}>
            <span className="btn-icon">↓</span>
            <span className="btn-label">Export CSV</span>
          </button>
          <button onClick={onPrint} style={btnStyle}>
            <span className="btn-icon">🖨</span>
            <span className="btn-label">Print</span>
          </button>
          {!isWarehouse && (
            <button onClick={onAddShipment} style={{
              ...btnStyle,
              background: 'var(--accent-green)',
              border: '1px solid var(--accent-green)',
              color: '#fff',
              fontWeight: 700,
            }}>
              <span className="btn-icon" style={{ fontWeight: 700 }}>+</span>
              <span className="btn-label">Add Shipment</span>
            </button>
          )}
          <img
            src="/caspr-logo.svg"
            alt="Powered by Caspr"
            style={{ height: '48px', width: 'auto', opacity: 0.75, marginLeft: '4px' }}
          />
        </div>
      </div>

      {/* Row 2: Tabs */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid var(--border)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {[
          { key: 'active',    label: 'Active'    },
          { key: 'delivered', label: 'Delivered' },
          { key: 'history',   label: 'History'   },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="tab-btn"
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-green)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
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
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};
