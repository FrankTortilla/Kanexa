'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ActivityLog({ orderId }) {
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteError, setNoteError] = useState(null);

  useEffect(() => {
    if (!supabase || !orderId) { setLoadingLog(false); setLoadingNotes(false); return; }

    supabase
      .from('production_order_activity')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setEntries(data || []); setLoadingLog(false); });

    supabase
      .from('production_order_notes')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setNotes(data || []); setLoadingNotes(false); });
  }, [orderId]);

  const handleAddNote = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    if (!supabase) return;
    setSaving(true);
    setNoteError(null);
    const { data, error } = await supabase
      .from('production_order_notes')
      .insert([{ order_id: orderId, note: trimmed }])
      .select()
      .single();
    setSaving(false);
    if (error) {
      setNoteError('Failed to save note. Please try again.');
      return;
    }
    setNotes(prev => [...prev, data]);
    setNoteText('');
  };

  const fmtTime = (ts) =>
    new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #333333' }}>

      {/* Activity Log */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Activity Log
      </div>
      {loadingLog ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>No activity recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {entries.map(entry => (
            <div key={entry.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '4px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: '120px', paddingTop: '1px' }}>
                {fmtTime(entry.created_at)}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {entry.action}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid #2a2a2a', margin: '16px 0' }} />

      {/* Notes */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Notes
      </div>
      {loadingNotes ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Loading…</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>No notes yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
          {notes.map(n => (
            <div key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '1px solid #2a2a2a', paddingBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888', flexShrink: 0, marginTop: '4px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  {fmtTime(n.created_at)}{n.author ? ` · ${n.author}` : ''}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {n.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add note input */}
      {noteError && (
        <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{noteError}</div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
          placeholder="Add a note…"
          rows={2}
          style={{
            flex: 1, padding: '8px 10px',
            background: '#111', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text-primary)',
            fontSize: '13px', fontFamily: 'inherit',
            resize: 'vertical', minHeight: '36px',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent-green)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <button
          onClick={handleAddNote}
          disabled={!noteText.trim() || saving}
          style={{
            padding: '8px 14px',
            background: noteText.trim() ? 'var(--accent-green)' : 'transparent',
            border: '1px solid var(--accent-green)',
            color: noteText.trim() ? '#fff' : 'var(--accent-green)',
            borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            cursor: noteText.trim() ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.6 : 1,
            fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Add Note'}
        </button>
      </div>
    </div>
  );
}
