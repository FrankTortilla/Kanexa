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
        padding: '14px 0 10px',
        gap: '16px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'var(--accent-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading), Oswald, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.5px',
              lineHeight: 1.1,
            }}>
              Production Planner
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
              GREEN STEEL
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleArchived}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: `1px solid ${showArchived ? 'var(--accent-green)' : 'var(--border)'}`,
              background: showArchived ? 'rgba(74,124,63,0.15)' : 'transparent',
              color: showArchived ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {showArchived ? '← Active' : '🗄 Archived'}
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
            }}
          >
            ↓ CSV
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
            }}
          >
            + Add Order
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border)' }}>
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
