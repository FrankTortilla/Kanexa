'use client';
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024;

function isAuthError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('jwt') || msg.includes('not authenticated') || err.status === 401;
}

export default function PODCell({ shipment, isWarehouse, onPodUpdate }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const [error, setError] = useState(null);

  const hasPod = !!shipment.pod_file_path;

  const handleOpen = async () => {
    if (!hasPod || !supabase) return;
    const { data, error: signErr } = await supabase.storage
      .from('pod-documents')
      .createSignedUrl(shipment.pod_file_path, 3600);
    if (signErr || !data?.signedUrl) {
      setError('Could not open file. Please try again.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Client-side quick check (UX only — server validates authoritatively below)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only PDF, JPG, PNG allowed');
      inputRef.current.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Max file size is 5 MB');
      inputRef.current.value = '';
      return;
    }

    // Server-side magic-bytes validation
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/pod/validate', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.valid) {
        setError(json.reason || 'File type not allowed');
        inputRef.current.value = '';
        return;
      }
    } catch {
      setError('Could not validate file — please try again');
      inputRef.current.value = '';
      setUploading(false);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const filePath = `shipments/${shipment.id}/pod.${ext}`;

    try {
      const { error: upErr } = await supabase.storage
        .from('pod-documents')
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from('shipments')
        .update({ pod_file_path: filePath })
        .eq('id', shipment.id);
      if (dbErr) throw dbErr;

      onPodUpdate(shipment.id, filePath);
    } catch (err) {
      if (isAuthError(err)) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
      inputRef.current.value = '';
    }
  };

  const handleDeletePod = async () => {
    if (!supabase || !shipment.pod_file_path) return;
    setDeleting(true);
    setError(null);
    try {
      // Step 1: delete from storage — abort entirely if this fails
      const { error: storageErr } = await supabase.storage
        .from('pod-documents')
        .remove([shipment.pod_file_path]);
      if (storageErr) {
        if (isAuthError(storageErr)) throw new Error('Your session has expired. Please log in again.');
        throw storageErr;
      }

      // Step 2: only clear the DB path after storage delete succeeded
      const { error: dbErr } = await supabase
        .from('shipments')
        .update({ pod_file_path: null })
        .eq('id', shipment.id);
      if (dbErr) {
        // Storage file is gone but DB still has the path — surface clearly
        if (isAuthError(dbErr)) throw new Error('Your session has expired. Please log in again.');
        throw new Error('File deleted but record could not be updated. Please contact support.');
      }

      onPodUpdate(shipment.id, null);
      setConfirmingDelete(false);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', fontSize: '12px', minWidth: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {hasPod ? (
          <>
            {/* View button */}
            <button
              onClick={handleOpen}
              title="View POD"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 0', color: '#38BDF8', fontSize: '12px', fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '13px', lineHeight: 1 }}>📎</span>
              <span>View</span>
            </button>

            {/* Replace button — office only */}
            {!isWarehouse && (
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading || deleting}
                title="Replace POD"
                onMouseEnter={() => setIconHovered(true)}
                onMouseLeave={() => setIconHovered(false)}
                style={{
                  background: 'none', border: 'none',
                  cursor: (uploading || deleting) ? 'wait' : 'pointer',
                  padding: '2px 4px', lineHeight: 1,
                  color: iconHovered ? '#94A3B8' : '#64748B',
                  fontSize: '14px',
                  transition: 'color 0.15s',
                  opacity: (uploading || deleting) ? 0.4 : 1,
                }}
              >
                ↑
              </button>
            )}

            {/* Delete POD button — office only */}
            {!isWarehouse && (
              <button
                onClick={() => setConfirmingDelete(true)}
                disabled={uploading || deleting}
                title="Delete POD"
                onMouseEnter={() => setTrashHovered(true)}
                onMouseLeave={() => setTrashHovered(false)}
                style={{
                  background: 'none', border: 'none',
                  cursor: (uploading || deleting) ? 'wait' : 'pointer',
                  padding: '2px 4px', lineHeight: 1,
                  color: trashHovered ? '#FF1744' : '#64748B',
                  fontSize: '13px',
                  transition: 'color 0.15s',
                  opacity: (uploading || deleting) ? 0.4 : 1,
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                <TrashIcon />
              </button>
            )}
          </>
        ) : (
          /* No POD — icon-only upload trigger for office, nothing for warehouse */
          !isWarehouse && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              title="Upload POD"
              onMouseEnter={() => setIconHovered(true)}
              onMouseLeave={() => setIconHovered(false)}
              style={{
                background: 'none', border: 'none', cursor: uploading ? 'wait' : 'pointer',
                padding: '2px 4px', lineHeight: 1,
                color: iconHovered ? '#94A3B8' : '#64748B',
                fontSize: '14px',
                transition: 'color 0.15s',
                opacity: uploading ? 0.4 : 1,
              }}
            >
              ↑
            </button>
          )
        )}

        {!isWarehouse && (
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--accent-danger)', fontSize: '10px', marginTop: '2px' }}>
          {error}
        </div>
      )}

      {/* Delete POD confirmation modal */}
      {confirmingDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmingDelete(false); }}
        >
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '28px 32px', maxWidth: '420px', width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '17px', fontWeight: 700 }}>
              Delete POD?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
              Are you sure you want to delete the POD for this shipment? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePod}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
                  fontWeight: 600, cursor: deleting ? 'wait' : 'pointer',
                  background: '#FF1744', color: '#fff', border: 'none',
                  fontFamily: 'inherit', opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Delete POD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </td>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
