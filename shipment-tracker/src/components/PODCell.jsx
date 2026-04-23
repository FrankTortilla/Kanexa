'use client';
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function PODCell({ shipment, isWarehouse, onPodUpdate }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pillHovered, setPillHovered] = useState(false);
  const [error, setError] = useState(null);

  const hasPod = !!shipment.pod_file_path;

  const handleOpen = async () => {
    if (!hasPod || !supabase) return;
    const { data, error: signErr } = await supabase.storage
      .from('pod-documents')
      .createSignedUrl(shipment.pod_file_path, 3600);
    if (signErr || !data?.signedUrl) {
      setError('Could not open file');
      setTimeout(() => setError(null), 3000);
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

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

    const ext = file.name.split('.').pop().toLowerCase();
    const filePath = `shipments/${shipment.id}/pod.${ext}`;

    setUploading(true);
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
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      inputRef.current.value = '';
    }
  };

  return (
    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', fontSize: '12px', minWidth: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {hasPod ? (
          /* POD exists — paperclip + "View" in blue */
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
        ) : (
          /* No POD — faint upload icon + "Upload" label */
          !isWarehouse && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              color: '#64748B', fontSize: '11px',
            }}>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>↑</span>
              <span>Upload</span>
            </span>
          )
        )}

        {/* Upload pill — office staff only, always visible as replace or initial upload */}
        {!isWarehouse && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              title={hasPod ? 'Replace POD' : 'Upload POD'}
              onMouseEnter={() => setPillHovered(true)}
              onMouseLeave={() => setPillHovered(false)}
              style={{
                background: '#1E293B',
                border: `1px solid ${pillHovered ? '#949494' : '#334155'}`,
                borderRadius: '6px',
                cursor: uploading ? 'wait' : 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                padding: '4px 10px',
                color: '#94A3B8',
                opacity: uploading ? 0.5 : 1,
                transition: 'border-color 0.15s',
                lineHeight: 1,
              }}
            >
              {uploading ? '…' : hasPod ? 'Replace' : ''}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
      {error && (
        <div style={{ color: 'var(--accent-danger)', fontSize: '10px', marginTop: '2px' }}>
          {error}
        </div>
      )}
    </td>
  );
}
