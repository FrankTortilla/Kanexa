'use client';
import { ORDER_TYPES } from '../lib/constants';

export default function Header({
  activeTab,
  onTabChange,
  tabCounts,
  onAddOrder,
  onExport,
}) {
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
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <img
          src="/GS-Grey-Logo.png"
          alt="Green Steel"
          style={{ height: '44px', width: 'auto', flexShrink: 0 }}
          onError={e => { e.currentTarget.src = '/green_steel_LOGO_copy.png'; }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onExport} style={btnStyle}>
            <span className="btn-icon">↓</span>
            <span className="btn-label"> CSV</span>
          </button>
          <button onClick={onAddOrder} style={{
            ...btnStyle,
            background: 'var(--accent-green)',
            border: '1px solid var(--accent-green)',
            color: '#fff',
            fontWeight: 700,
          }}>
            <span className="btn-icon" style={{ fontWeight: 700 }}>+</span>
            <span className="btn-label"> Add Order</span>
          </button>

          {/* Powered by Caspr */}
          <img src="/caspr-logo.svg" alt="Caspr" style={{ height: '38px', width: 'auto', opacity: 0.75, marginLeft: '8px' }} />
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
        {ORDER_TYPES.map((type) => {
          const isActive = activeTab === type;
          const count = tabCounts[type] ?? 0;
          return (
            <button
              key={type}
              onClick={() => onTabChange(type)}
              className="tab-btn"
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-green)' : '2px solid transparent',
                color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'color 0.15s',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              {type}
              <span style={{
                background: isActive ? 'var(--accent-green)' : 'var(--border)',
                color: isActive ? '#1a1a1a' : 'var(--text-secondary)',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: 700,
                minWidth: '20px',
                textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          );
        })}
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
  fontFamily: 'inherit',
};
