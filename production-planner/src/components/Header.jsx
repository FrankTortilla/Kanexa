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
      background: '#222222',
      borderBottom: '1px solid #333333',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top row — 125px tall */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '125px',
      }}>
        {/* Logo */}
        <img
          src="/GS-Grey-Logo.png"
          alt="Green Steel"
          style={{ height: '70px', width: 'auto', flexShrink: 0 }}
          onError={e => { e.currentTarget.src = '/green_steel_LOGO_copy.png'; }}
        />

        {/* Actions — pushed right via auto margin */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleArchived}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: `1px solid ${showArchived ? 'var(--accent-green)' : '#333333'}`,
              background: showArchived ? 'rgba(104,184,87,0.15)' : 'transparent',
              color: showArchived ? 'var(--accent-green)' : '#888888',
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
              border: '1px solid #333333',
              background: 'transparent',
              color: '#888888',
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
              background: '#68b857',
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

        {/* POWERED BY — far right, separated from buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0.75,
          marginLeft: '28px',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            color: '#888888',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            POWERED BY
          </span>
          <img
            src="/caspr-logo.svg"
            alt="Caspr"
            style={{ height: '38px', width: 'auto' }}
          />
        </div>
      </div>

      {/* Tab row */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderTop: '1px solid #333333',
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
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                color: isActive ? '#ffffff' : '#888888',
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
                background: isActive ? '#ffffff' : '#333333',
                color: isActive ? '#191919' : '#888888',
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
