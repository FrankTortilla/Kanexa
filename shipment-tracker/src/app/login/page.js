'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  // If already logged in, skip straight to the app
  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/');
      else setChecking(false);
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) { setError('Supabase not configured — check .env.local'); return; }
    setError('');
    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      setError(authErr.message);
      setLoading(false);
    } else {
      router.replace('/');
    }
  };

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)',
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.png" alt="Green Steel" style={{ height: '48px', marginBottom: '16px' }} />
          <h1 style={{
            fontFamily: 'var(--font-heading), Oswald, sans-serif',
            fontSize: '24px', fontWeight: 700, margin: 0,
            color: 'var(--text-primary)', letterSpacing: '0.5px',
          }}>
            Shipment Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Green Steel Manufacturing
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: '6px', marginBottom: '20px',
            border: '1px solid var(--accent-danger)',
            background: 'rgba(255,23,68,0.1)',
            color: 'var(--accent-danger)', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '6px', border: 'none',
              background: 'var(--accent-green)', color: '#fff',
              fontFamily: 'var(--font-heading), Oswald, sans-serif',
              fontSize: '16px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: '15px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};
