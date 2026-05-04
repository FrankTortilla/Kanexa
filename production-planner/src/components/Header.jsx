'use client';
import { ORDER_TYPES } from '../lib/constants';

export default function Header({
  activeTab,
  onTabChange,
  tabCounts,
  onAddOrder,
  onExport,
  showArchived,
  onToggleArchived,
}) {
  return (
    <header style={{
      background: '#111111',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        gap: '16px',
      }}>
        {/* Logo */}
        <img
          src="/green_steel_LOGO_copy.png"
          alt="SureBuilT"
          style={{ height: '44px', width: 'auto' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleArchived}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: `1px solid ${showArchived ? 'var(--accent-green)' : 'var(--border)'}`,
              background: showArchived ? 'rgba(150,186,148,0.15)' : 'transparent',
              color: showArchived ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span className="btn-icon">{showArchived ? '←' : '🗄'}</span>
            <span className="btn-label">{showArchived ? ' Active' : ' Archived'}</span>
          </button>
          <button
            onClick={onExport}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span className="btn-icon">↓</span>
            <span className="btn-label"> CSV</span>
          </button>
          <button
            onClick={onAddOrder}
            style={{
              padding: '8px 18px',
              borderRadius: '7px',
              border: 'none',
              background: 'var(--accent-green)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span className="btn-icon">+</span>
            <span className="btn-label"> Add Order</span>
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div style={{
        display: 'flex',
        gap: '0',
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
                background: isActive ? 'var(--accent-green)' : '#333',
                color: isActive ? '#fff' : 'var(--text-secondary)',
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
