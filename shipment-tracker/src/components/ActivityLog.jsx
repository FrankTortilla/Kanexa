'use client';
import { useState } from 'react';
import { useShipmentNotes } from '../hooks/useShipmentNotes';
import { formatTimestamp } from '../utils/formatters';

export default function ActivityLog({ shipmentId, isWarehouse }) {
  const { notes, loading, addNote } = useShipmentNotes(shipmentId);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    try {
      await addNote(noteText);
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{
        fontFamily: 'var(--font-heading), Oswald, sans-serif',
        fontSize: '14px', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.5px', color: 'var(--text-secondary)', margin: '0 0 12px',
      }}>
        Activity Log
      </h4>

      {/* Add note input — admin only */}
      {!isWarehouse && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Add a note..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '8px 12px', fontSize: '14px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!noteText.trim() || saving}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: noteText.trim() ? 'var(--accent-green)' : 'var(--bg-hover)',
              color: noteText.trim() ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '13px', cursor: noteText.trim() ? 'pointer' : 'default',
            }}
          >
            {saving ? '...' : 'Add Note'}
          </button>
        </div>
      )}

      {loading && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading notes...</p>}

      {!loading && notes.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No notes yet.</p>
      )}

      {notes.map(note => (
        <div key={note.id} style={{
          padding: '8px 0',
          borderBottom: '1px solid var(--border)',
          fontSize: '14px',
          color: 'var(--text-primary)',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', marginRight: '8px' }}>
            {formatTimestamp(note.created_at)}
          </span>
          — {note.note_text}
        </div>
      ))}
    </div>
  );
}
