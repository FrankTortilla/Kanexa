'use client';
import { useState, useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import PODCell from './PODCell';
import Pagination from './Pagination';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';
import { formatDate } from '../utils/formatters';
import { supabase } from '../lib/supabase';
import { exportToCSV } from './ExportCSV';

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isAuthError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('jwt') || msg.includes('not authenticated') || err.status === 401;
}

export default function ShipmentHistory({
  fetchAllShipments,
  unarchiveShipment,
  permanentDeleteShipment,
  searchQuery,
  isWarehouse,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) {
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivePage, setArchivePage] = useState(1);
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [confirmDelete, setConfirmDelete] = useState(null); // shipment object or null
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAllShipments().then(data => {
      if (mounted) {
        setAllShipments(data.filter(s => !!s.archived_at || !!s.deleted_at));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [fetchAllShipments]);

  // Realtime: remove hard-deleted rows from local state for all users
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('history-shipments-deletes')
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'shipments' },
        (payload) => {
          setAllShipments(prev => prev.filter(s => s.id !== payload.old.id));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePodUpdate = (id, filePath) => {
    setAllShipments(prev => prev.map(s => s.id === id ? { ...s, pod_file_path: filePath } : s));
  };

  const searchFields = [
    'customer_name', 'city', 'state', 'material', 'po_number',
    'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type',
  ];

  const archiveShipments = useMemo(() => {
    let result = allShipments;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => {
        const direct = searchFields.some(f => s[f] && String(s[f]).toLowerCase().includes(q));
        const matMatch = s.shipment_materials && s.shipment_materials.some(m =>
          (m.material_name && m.material_name.toLowerCase().includes(q))
        );
        return direct || matMatch;
      });
    }
    if (dateFrom) result = result.filter(s => s.ship_date >= dateFrom);
    if (dateTo)   result = result.filter(s => s.ship_date <= dateTo);
    return [...result].sort((a, b) => {
      if ((a.archived_at || '') > (b.archived_at || '')) return -1;
      if ((a.archived_at || '') < (b.archived_at || '')) return 1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allShipments, searchQuery, dateFrom, dateTo]);

  const paginatedArchive = useMemo(() => {
    const start = (archivePage - 1) * archiveRowsPerPage;
    return archiveShipments.slice(start, start + archiveRowsPerPage);
  }, [archiveShipments, archivePage, archiveRowsPerPage]);

  const handleUnarchive = async (shipment) => {
    if (!unarchiveShipment) return;
    await unarchiveShipment(shipment.id);
    setAllShipments(prev => prev.filter(s => s.id !== shipment.id));
  };

  const handleConfirmPermanentDelete = async () => {
    if (!confirmDelete || !permanentDeleteShipment) return;
    setDeleting(true);
    try {
      await permanentDeleteShipment(confirmDelete.id);
      setAllShipments(prev => prev.filter(s => s.id !== confirmDelete.id));
      setConfirmDelete(null);
      showToast('Shipment permanently deleted');
    } catch (err) {
      setConfirmDelete(null);
      if (isAuthError(err)) {
        showToast('Your session has expired. Please log in again.', true);
      } else {
        showToast(err.message || 'Delete failed. Please try again.', true);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading history...
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1100,
          background: toast.isError ? '#FF1744' : 'var(--accent-green)',
          color: '#fff', padding: '14px 22px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600,
          boxShadow: toast.isError ? '0 4px 24px rgba(255,23,68,0.4)' : '0 4px 24px rgba(74,124,63,0.4)',
          animation: 'fade-in 0.3s ease-out',
          pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Permanent delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (!deleting && e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '28px 32px', maxWidth: '460px', width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ margin: '0 0 8px', color: '#FF1744', fontSize: '18px', fontWeight: 700 }}>
              Permanently Delete Shipment?
            </h3>

            {/* Shipment summary */}
            <div style={{
              background: 'var(--bg-primary)', borderRadius: '8px',
              padding: '12px 16px', margin: '12px 0 16px',
              border: '1px solid var(--border)',
            }}>
              <SummaryRow label="Customer" value={confirmDelete.customer_name} />
              <SummaryRow label="PO#" value={confirmDelete.po_number} />
              <SummaryRow label="Ship Date" value={formatDate(confirmDelete.ship_date)} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
              This will <strong style={{ color: '#FF1744' }}>permanently delete</strong> this shipment record.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
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
                onClick={handleConfirmPermanentDelete}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
                  fontWeight: 600, cursor: deleting ? 'wait' : 'pointer',
                  background: '#FF1744', color: '#fff', border: 'none',
                  fontFamily: 'inherit', opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date range pickers + export */}
      <div className="no-print" style={{
        display: 'flex', gap: '12px', padding: '12px 24px',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>From:</label>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} style={dateInputStyle} />
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>To:</label>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} style={dateInputStyle} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {archiveShipments.length} record{archiveShipments.length !== 1 ? 's' : ''}
        </span>
        {archiveShipments.length > 0 && (
          <button
            onClick={() => exportToCSV(archiveShipments, 'history')}
            className="no-print"
            style={{
              marginLeft: 'auto', padding: '7px 16px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Export CSV
          </button>
        )}
      </div>

      {archiveShipments.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No archived records.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Ship Date', 'Del. Date', 'Customer', 'City/State', 'Materials', 'PO#', 'Carrier', 'Trailer Type', 'Weight', 'Status', 'Archived On', 'Price', 'POD', 'Actions'].map(h => (
                    <th key={h} style={archiveThStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedArchive.map(s => {
                  const matItems = s.shipment_materials && s.shipment_materials.length > 0
                    ? s.shipment_materials
                    : s.material ? [{ quantity: s.quantity != null ? String(s.quantity) : '', material_name: s.material }] : [];
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <ArchiveCell>{formatDate(s.ship_date)}</ArchiveCell>
                      <ArchiveCell>{s.delivery_date ? formatDate(s.delivery_date) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>TBD</span>}</ArchiveCell>
                      <ArchiveCell>{s.customer_name}</ArchiveCell>
                      <ArchiveCell>{s.city}{s.state ? `, ${s.state}` : ''}</ArchiveCell>
                      <td style={archiveTdStyle}>
                        <div style={{ maxWidth: '180px' }}>
                          {matItems.map((m, i) => (
                            <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.quantity ? `${m.quantity} ` : ''}{m.material_name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <ArchiveCell>{s.po_number}</ArchiveCell>
                      <ArchiveCell>{s.carrier_name}</ArchiveCell>
                      <td style={{
                        ...archiveTdStyle,
                        color: s.trailer_type === 'Hotshot' ? 'var(--accent-danger)' : 'var(--text-primary)',
                        fontWeight: s.trailer_type === 'Hotshot' ? 700 : 400,
                      }}>
                        {s.trailer_type || ''}
                      </td>
                      <ArchiveCell>{s.weight}</ArchiveCell>
                      <td style={archiveTdStyle}>
                        <StatusBadge status={s.status} isWarehouse={false} />
                      </td>
                      <ArchiveCell>{formatTimestamp(s.archived_at)}</ArchiveCell>
                      <ArchiveCell>{s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}</ArchiveCell>

                      {/* POD column */}
                      <PODCell
                        shipment={s}
                        isWarehouse={isWarehouse}
                        onPodUpdate={handlePodUpdate}
                      />

                      {/* Actions */}
                      <td style={{ ...archiveTdStyle, whiteSpace: 'nowrap' }}>
                        {!isWarehouse && (
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <button
                              onClick={() => handleUnarchive(s)}
                              style={{
                                background: 'none', border: 'none',
                                color: 'var(--accent-delivered)',
                                cursor: 'pointer', fontSize: '12px',
                                fontWeight: 600, padding: '4px 8px',
                                fontFamily: 'inherit',
                              }}
                            >
                              Unarchive
                            </button>

                            {/* Visual divider between Unarchive and Delete */}
                            <span style={{
                              display: 'inline-block', width: '1px', height: '16px',
                              background: 'var(--border)', margin: '0 6px', flexShrink: 0,
                            }} />

                            <button
                              onClick={() => setConfirmDelete(s)}
                              style={{
                                background: 'none', border: 'none',
                                color: '#FF1744',
                                cursor: 'pointer', fontSize: '12px',
                                fontWeight: 600, padding: '4px 8px',
                                fontFamily: 'inherit',
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                              }}
                            >
                              <HistoryTrashIcon />
                              Delete
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={archivePage}
            totalItems={archiveShipments.length}
            rowsPerPage={archiveRowsPerPage}
            onPageChange={setArchivePage}
            onRowsPerPageChange={p => { setArchiveRowsPerPage(p); setArchivePage(1); }}
          />
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
      <span style={{ color: 'var(--text-secondary)', minWidth: '72px' }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}

function ArchiveCell({ children }) {
  return <td style={archiveTdStyle}>{children ?? ''}</td>;
}

function HistoryTrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

const archiveTdStyle = {
  padding: '10px 10px',
  color: 'var(--text-primary)',
};

const archiveThStyle = {
  textAlign: 'left',
  padding: '10px 10px',
  fontFamily: 'var(--font-heading), Oswald, sans-serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '11px',
  color: '#94A3B8',
  background: '#363636',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  whiteSpace: 'nowrap',
};

const dateInputStyle = {
  padding: '8px 12px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  outline: 'none',
};
