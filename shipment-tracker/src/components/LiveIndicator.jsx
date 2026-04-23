'use client';
import { useState, useEffect, useCallback } from 'react';

export default function LiveIndicator({ isWarehouse, onFallbackRefetch }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connected, setConnected] = useState(true);

  // Update timestamp whenever this component re-renders from parent (realtime event)
  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Listen for online/offline as a proxy for connection status
  useEffect(() => {
    const goOffline = () => setConnected(false);
    const goOnline = () => { setConnected(true); setLastUpdated(new Date()); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // 60-second fallback re-fetch
  useEffect(() => {
    if (!isWarehouse || !onFallbackRefetch) return;
    const interval = setInterval(() => {
      onFallbackRefetch();
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [isWarehouse, onFallbackRefetch]);

  // Expose a way for parent to bump the timestamp
  const bump = useCallback(() => setLastUpdated(new Date()), []);

  if (!isWarehouse) return null;

  const timeStr = lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="no-print" style={{
      position: 'fixed', bottom: '16px', right: '16px', zIndex: 40,
      padding: '8px 16px', borderRadius: '8px',
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '13px', color: 'var(--text-secondary)',
    }}>
      {connected ? (
        <>
          <span className="animate-live-pulse" style={{
            display: 'inline-block', width: '8px', height: '8px',
            borderRadius: '50%', background: 'var(--accent-live)',
          }} />
          <span style={{ fontWeight: 600, color: 'var(--accent-live)' }}>Live</span>
          <span>— Last updated: {timeStr}</span>
        </>
      ) : (
        <>
          <span style={{
            display: 'inline-block', width: '8px', height: '8px',
            borderRadius: '50%', background: 'var(--accent-warning)',
          }} />
          <span style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>Reconnecting...</span>
        </>
      )}
    </div>
  );
}
