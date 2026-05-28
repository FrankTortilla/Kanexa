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
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <img
          src="/green_steel_LOGO_copy.png"
          alt="SureBuilT"
          style={{ height: '44px', width: 'auto' }}
        />

        {/* Waypoint product logo — centered */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375.95 90.83"
            height="48"
            style={{ width: 'auto', maxHeight: '48px' }}
            aria-label="Waypoint Shipment Tracking"
          >
            <defs>
              <style>{`.wpt0{fill:#878787}`}</style>
            </defs>
            <g>
              <path className="wpt0" d="M11.11,14.74h16.62l5.56,26.34h.35c.39-3.47.84-6.18,1.35-8.13l4.68-18.2h12.29l6.03,26.34h.35c.31-3.28.68-5.87,1.11-7.78l4.45-18.55h16.68l-15.57,44.13h-13.99l-5.03-24h-.53c-.23,3.24-.51,5.46-.82,6.67l-4.45,17.32h-13.64L11.11,14.74Z"/>
              <path className="wpt0" d="M92.52,53.37l-1.29,5.5h-16.97l15.33-44.13h17.73l15.74,44.13h-16.97l-1.46-5.5h-12.11ZM95.38,42.89h6.44l-1.87-7.78c-.31-1.17-.66-3.06-1.05-5.68h-.59l-2.93,13.46Z"/>
              <path className="wpt0" d="M116.45,14.74h18.14l4.92,11.53h.47c.74-2.26,1.23-3.65,1.46-4.15l3.16-7.37h18.03l-15.1,25.11v19.02h-15.68v-19.02l-15.39-25.11Z"/>
              <path className="wpt0" d="M165.79,58.87V14.74h20.31c5.38,0,9.71,1.39,12.99,4.15,3.28,2.77,4.92,6.79,4.92,12.06,0,4.49-1.31,8.05-3.92,10.68-2.61,2.63-6.17,3.95-10.65,3.95h-8.19v13.29h-15.45ZM181.24,26.8v7.67h1.58c1.76,0,3.17-.27,4.24-.82,1.07-.55,1.61-1.62,1.61-3.22,0-.82-.17-1.49-.5-2.02-.33-.53-.83-.9-1.49-1.11-.66-.21-1.28-.35-1.84-.41-.57-.06-1.26-.09-2.08-.09h-1.52Z"/>
              <path className="wpt0" d="M213.87,20.39c4.7-4.23,10.48-6.35,17.35-6.35s12.65,2.12,17.35,6.35c4.7,4.23,7.05,9.74,7.05,16.53s-2.33,12.41-6.99,16.5c-4.66,4.1-10.47,6.15-17.41,6.15s-12.75-2.05-17.41-6.15-6.99-9.6-6.99-16.5,2.35-12.3,7.05-16.53ZM237.19,31.04c-1.52-1.66-3.51-2.49-5.97-2.49s-4.45.83-5.97,2.49c-1.52,1.66-2.28,3.7-2.28,6.12s.77,4.54,2.31,6.12c1.54,1.58,3.52,2.37,5.94,2.37s4.4-.79,5.94-2.37c1.54-1.58,2.31-3.62,2.31-6.12s-.76-4.46-2.28-6.12Z"/>
              <path className="wpt0" d="M261.42,58.87V14.74h16.04v44.13h-16.04Z"/>
              <path className="wpt0" d="M284.65,58.87V14.74h15.39l14.4,24.46h.47c-.9-5.15-1.35-8.9-1.35-11.24v-13.23h15.33v44.13h-15.33l-14.1-23.18h-.47c.66,3.82,1,6.77,1,8.84v14.34h-15.33Z"/>
              <path className="wpt0" d="M332.87,29.08v-14.34h33.71v14.34l-8.84-.41v30.2h-16.04v-30.2l-8.84.41Z"/>
            </g>
            <g>
              <path className="wpt0" d="M98.25,69.74l-1.58.94c-.59-.99-1.44-1.49-2.54-1.49-.67,0-1.28.21-1.83.63-.55.42-.82.96-.82,1.62,0,.95.74,1.71,2.21,2.27l1.13.44c1.26.49,2.23,1.1,2.91,1.83.68.73,1.02,1.71,1.02,2.94,0,1.43-.49,2.61-1.46,3.54-.97.93-2.17,1.4-3.6,1.4-1.27,0-2.37-.42-3.28-1.25-.91-.83-1.45-1.89-1.62-3.18l2-.42c-.01.85.28,1.57.87,2.14.59.57,1.33.86,2.19.86s1.54-.3,2.09-.91c.55-.61.83-1.33.83-2.17,0-.77-.24-1.38-.72-1.82-.48-.44-1.15-.84-2.01-1.19l-1.09-.46c-1.08-.46-1.92-.99-2.53-1.6-.61-.6-.91-1.41-.91-2.42,0-1.23.46-2.22,1.39-2.97s2.02-1.12,3.28-1.12c1.82,0,3.18.8,4.07,2.39Z"/>
              <path className="wpt0" d="M102.72,74.07h7.54v-6.38h1.97v15.83h-1.97v-7.6h-7.54v7.6h-1.97v-15.83h1.97v6.38Z"/>
              <path className="wpt0" d="M117,67.68v15.83h-1.97v-15.83h1.97Z"/>
              <path className="wpt0" d="M121.94,76.88v6.64h-1.97v-15.83h2.27c2.34,0,3.99.38,4.95,1.14.96.76,1.44,1.91,1.44,3.43s-.51,2.73-1.54,3.49c-1.03.76-2.36,1.13-4,1.13h-1.13ZM121.94,69.45v5.67h.63c.57,0,1.08-.03,1.52-.1.44-.07.88-.2,1.31-.39.43-.19.77-.49,1.01-.89.24-.41.36-.91.36-1.51s-.13-1.08-.38-1.47c-.25-.39-.61-.68-1.07-.85-.46-.17-.91-.29-1.34-.36-.43-.06-.94-.09-1.51-.09h-.53Z"/>
              <path className="wpt0" d="M137.79,83.85l-4.75-10.79h-.04l-1.85,10.46h-2.04l3.23-16.51,5.44,12.47,5.44-12.47,3.23,16.51h-2.04l-1.85-10.46h-.04l-4.75,10.79Z"/>
              <path className="wpt0" d="M148.23,83.52v-15.83h8.5v1.81h-6.53v4.43h6.34v1.81h-6.34v5.98h6.53v1.81h-8.5Z"/>
              <path className="wpt0" d="M158.98,83.52v-16.59l11.89,12.45v-11.7h1.97v16.48l-11.89-12.45v11.8h-1.97Z"/>
              <path className="wpt0" d="M179.92,69.49v14.03h-1.97v-14.03h-3.76v-1.81h9.49v1.81h-3.76Z"/>
              <path className="wpt0" d="M195.56,69.49v14.03h-1.97v-14.03h-3.76v-1.81h9.49v1.81h-3.76Z"/>
              <path className="wpt0" d="M205.72,76.63l5,6.89h-2.39l-4.66-6.7h-.82v6.7h-1.97v-15.83h2.39c.6,0,1.09.01,1.46.03.37.02.82.09,1.34.2.52.11.98.28,1.38.5.64.38,1.15.91,1.52,1.6s.56,1.41.56,2.18c0,1.15-.35,2.14-1.05,2.97-.7.83-1.62,1.32-2.75,1.46ZM202.85,69.45v5.73h.63c.57,0,1.08-.03,1.52-.1.44-.07.88-.2,1.31-.39.43-.19.77-.49,1.01-.89.24-.41.36-.91.36-1.51,0-1.89-1.44-2.83-4.3-2.83h-.53Z"/>
              <path className="wpt0" d="M221.79,79.55h-7.27l-1.81,3.97h-2.12l7.56-16.51,7.56,16.51h-2.12l-1.81-3.97ZM220.97,77.74l-2.81-6.41-2.81,6.41h5.63Z"/>
              <path className="wpt0" d="M238.57,68.42v2.29c-1.16-1.04-2.56-1.55-4.18-1.55-1.75,0-3.23.63-4.44,1.9s-1.82,2.79-1.82,4.57.6,3.26,1.8,4.53c1.2,1.27,2.67,1.9,4.42,1.9,1.6,0,3-.55,4.22-1.64v2.33c-1.26.74-2.65,1.11-4.16,1.11-2.27,0-4.21-.79-5.83-2.37-1.62-1.58-2.43-3.51-2.43-5.8s.82-4.31,2.46-5.92c1.64-1.61,3.63-2.42,5.96-2.42,1.5,0,2.83.36,3.99,1.07Z"/>
              <path className="wpt0" d="M242.89,74.55l6.72-6.87h2.58l-7.12,7.12,7.25,8.71h-2.67l-5.96-7.37-.8.76v6.62h-1.97v-15.83h1.97v6.87Z"/>
              <path className="wpt0" d="M255.43,67.68v15.83h-1.97v-15.83h1.97Z"/>
              <path className="wpt0" d="M258.2,83.52v-16.59l11.89,12.45v-11.7h1.97v16.48l-11.89-12.45v11.8h-1.97Z"/>
              <path className="wpt0" d="M283.02,75.54h6.28v.63c0,2.2-.7,4.03-2.1,5.49s-3.2,2.19-5.4,2.19-4.08-.82-5.65-2.45-2.35-3.55-2.35-5.76.8-4.23,2.4-5.86c1.6-1.62,3.54-2.44,5.81-2.44,1.25,0,2.44.27,3.58.81s2.1,1.29,2.87,2.26l-1.39,1.32c-.57-.78-1.31-1.41-2.21-1.88-.9-.47-1.82-.7-2.77-.7-1.76,0-3.26.63-4.48,1.88s-1.84,2.77-1.84,4.55.61,3.2,1.82,4.5c1.21,1.31,2.66,1.96,4.34,1.96,1.26,0,2.43-.47,3.51-1.41,1.08-.94,1.64-2.04,1.68-3.3h-4.09v-1.81Z"/>
            </g>
          </svg>
        </div>

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
