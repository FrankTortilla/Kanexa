'use client';
import { useState, useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import PODCell from './PODCell';
import { formatDate } from '../utils/formatters';
import { supabase } from '../lib/supabase';
import { exportToCSV } from './ExportCSV';

// ── Week helpers ──────────────────────────────────────────────────────────────

function getWeekKey(dateStr) {
  if (!dateStr || dateStr === 'TBD') return null;
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return null;
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD" of that Monday
}

function formatWeekLabel(mondayStr) {
  const monday = new Date(mondayStr + 'T12:00:00');
  const friday = new Date(mondayStr + 'T12:00:00');
  friday.setDate(friday.getDate() + 4);

  if (monday.getFullYear() !== friday.getFullYear()) {
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', opts)}`;
  }
  const opts = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', opts)}`;
}

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

const SEARCH_FIELDS = [
  'customer_name', 'city', 'state', 'material', 'po_number',
  'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type',
];

// ── Main component ────────────────────────────────────────────────────────────

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
  onMetricsChange,
}) {
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'delivery_date', direction: 'desc' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' }
    );
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Load data
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

  // Realtime: remove hard-deleted rows
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('history-shipments-deletes')
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'shipments' },
        (payload) => { setAllShipments(prev => prev.filter(s => s.id !== payload.old.id)); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePodUpdate = (id, filePath) => {
    setAllShipments(prev => prev.map(s => s.id === id ? { ...s, pod_file_path: filePath } : s));
  };

  // ── Filtering pipeline ──────────────────────────────────────────────────────

  // 1. Search filter applied to all
  const searchFiltered = useMemo(() => {
    if (!searchQuery?.trim()) return allShipments;
    const q = searchQuery.toLowerCase();
    return allShipments.filter(s => {
      const direct = SEARCH_FIELDS.some(f => s[f] && String(s[f]).toLowerCase().includes(q));
      const matMatch = s.shipment_materials?.some(m => m.material_name?.toLowerCase().includes(q));
      return direct || matMatch;
    });
  }, [allShipments, searchQuery]);

  // 2. Split dated vs undated (undated always visible regardless of date filter)
  const undatedShipments = useMemo(
    () => searchFiltered.filter(s => !s.ship_date || s.ship_date === 'TBD'),
    [searchFiltered]
  );

  const datedShipments = useMemo(
    () => searchFiltered.filter(s => s.ship_date && s.ship_date !== 'TBD'),
    [searchFiltered]
  );

  // 3. Date range applied to dated only
  const dateFilteredDated = useMemo(() => {
    let result = datedShipments;
    if (dateFrom) result = result.filter(s => s.ship_date >= dateFrom);
    if (dateTo)   result = result.filter(s => s.ship_date <= dateTo);
    return result;
  }, [datedShipments, dateFrom, dateTo]);

  // 4. Build week groups; rows sorted by sortConfig within each week
  const weekData = useMemo(() => {
    const weekMap = {};
    dateFilteredDated.forEach(s => {
      const key = getWeekKey(s.ship_date);
      if (!key) return;
      if (!weekMap[key]) weekMap[key] = [];
      weekMap[key].push(s);
    });
    Object.values(weekMap).forEach(arr =>
      arr.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        const cmp = aVal.localeCompare(bVal);
        return sortConfig.direction === 'desc' ? -cmp : cmp;
      })
    );
    const sortedKeys = Object.keys(weekMap).sort((a, b) => b.localeCompare(a));
    return { weekMap, sortedKeys };
  }, [dateFilteredDated, sortConfig]);

  // All weeks start collapsed — user expands on demand

  // 6. Reset selectedWeek if it becomes empty after date filter change
  useEffect(() => {
    if (selectedWeek !== 'all' && !weekData.weekMap[selectedWeek]) {
      setSelectedWeek('all');
    }
  }, [weekData, selectedWeek]);

  // 7. Which week keys to render
  const visibleWeekKeys = selectedWeek === 'all'
    ? weekData.sortedKeys
    : weekData.sortedKeys.filter(k => k === selectedWeek);

  // 8. What CSV export sees (respects both filters)
  const exportShipments = useMemo(() => {
    const weekShipments = visibleWeekKeys.flatMap(k => weekData.weekMap[k] || []);
    const exportUndated = selectedWeek === 'all' ? undatedShipments : [];
    return [...weekShipments, ...exportUndated];
  }, [visibleWeekKeys, weekData, selectedWeek, undatedShipments]);

  const totalVisible = exportShipments.length;

  // Report price/weight totals to parent whenever filtered set changes
  useEffect(() => {
    if (!onMetricsChange) return;
    const totalPrice = exportShipments.reduce((sum, s) => {
      const v = Number(s.price);
      return Number.isFinite(v) ? sum + v : sum;
    }, 0);
    const totalWeight = exportShipments.reduce((sum, s) => {
      const v = Number(s.weight);
      return Number.isFinite(v) ? sum + v : sum;
    }, 0);
    onMetricsChange({ totalPrice, totalWeight });
  }, [exportShipments, onMetricsChange]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleWeekSelect = (weekKey) => {
    setSelectedWeek(weekKey);
    if (weekKey !== 'all') {
      setExpandedWeeks(new Set([weekKey]));
    }
  };

  const toggleWeek = (key) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

  // ── Render ──────────────────────────────────────────────────────────────────

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

      {/* ── Week selector ────────────────────────────────────────────── */}
      <div className="no-print" style={{
        display: 'flex', gap: '10px', padding: '12px 24px 0',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Week:
        </label>
        <select
          value={selectedWeek}
          onChange={e => handleWeekSelect(e.target.value)}
          style={{
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Weeks</option>
          {weekData.sortedKeys.map(key => (
            <option key={key} value={key}>{formatWeekLabel(key)}</option>
          ))}
        </select>
      </div>

      {/* ── Date range pickers + export ──────────────────────────────── */}
      <div className="no-print" style={{
        display: 'flex', gap: '12px', padding: '12px 24px',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>From:</label>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} style={dateInputStyle} />
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>To:</label>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} style={dateInputStyle} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {totalVisible} record{totalVisible !== 1 ? 's' : ''}
        </span>
        {totalVisible > 0 && (
          <button
            onClick={() => exportToCSV(exportShipments, 'history')}
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

      {/* ── Content ──────────────────────────────────────────────────── */}
      {totalVisible === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No archived records.
        </div>
      ) : (
        <div>
          {visibleWeekKeys.map(weekKey => (
            <WeekGroup
              key={weekKey}
              label={formatWeekLabel(weekKey)}
              loads={weekData.weekMap[weekKey] || []}
              isExpanded={expandedWeeks.has(weekKey)}
              onToggle={() => toggleWeek(weekKey)}
              isWarehouse={isWarehouse}
              onUnarchive={handleUnarchive}
              onDelete={(s) => setConfirmDelete(s)}
              onPodUpdate={handlePodUpdate}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          ))}

          {/* Undated group — only when All Weeks and undated exist */}
          {selectedWeek === 'all' && undatedShipments.length > 0 && (
            <WeekGroup
              label="Undated"
              loads={undatedShipments}
              isExpanded={expandedWeeks.has('__undated__')}
              onToggle={() => toggleWeek('__undated__')}
              isWarehouse={isWarehouse}
              onUnarchive={handleUnarchive}
              onDelete={(s) => setConfirmDelete(s)}
              onPodUpdate={handlePodUpdate}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Week group section ────────────────────────────────────────────────────────

const SORTABLE_COLS = [
  { label: 'Ship Date',    key: 'ship_date' },
  { label: 'Del. Date',   key: 'delivery_date' },
  { label: 'Customer',    key: null },
  { label: 'City/State',  key: null },
  { label: 'Materials',   key: null },
  { label: 'PO#',         key: null },
  { label: 'Carrier',     key: null },
  { label: 'Tracking#',   key: null },
  { label: 'Trailer Type',key: null },
  { label: 'Weight',      key: null },
  { label: 'Status',      key: null },
  { label: 'Archived On', key: null },
  { label: 'Price',       key: null },
  { label: 'POD',         key: null },
  { label: 'Actions',     key: null },
];

function WeekGroup({ label, loads, isExpanded, onToggle, isWarehouse, onUnarchive, onDelete, onPodUpdate, sortConfig, onSort }) {
  const count = loads.length;
  return (
    <div>
      {/* Group header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          marginBottom: '10px',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          color: '#94A3B8',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}>▶</span>
        <span style={{
          fontFamily: 'var(--font-heading), Oswald, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text-primary)',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontWeight: 500,
          fontFamily: 'var(--font-body), inherit',
          textTransform: 'none',
          letterSpacing: 0,
        }}>· {count} {count === 1 ? 'load' : 'loads'}</span>
      </button>

      {/* Collapsible body */}
      {isExpanded && (
        count === 0 ? (
          <div style={{ padding: '24px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
            No shipments found for this period.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {SORTABLE_COLS.map(col => {
                    const isSorted = sortConfig.key === col.key;
                    const canSort = !!col.key;
                    return (
                      <th
                        key={col.label}
                        onClick={() => canSort && onSort(col.key)}
                        style={{
                          ...thStyle,
                          cursor: canSort ? 'pointer' : 'default',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col.label}
                        {isSorted && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loads.map(s => (
                  <HistoryRow
                    key={s.id}
                    shipment={s}
                    isWarehouse={isWarehouse}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                    onPodUpdate={onPodUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ── History table row ─────────────────────────────────────────────────────────

function HistoryRow({ shipment: s, isWarehouse, onUnarchive, onDelete, onPodUpdate }) {
  const matItems = s.shipment_materials && s.shipment_materials.length > 0
    ? s.shipment_materials
    : s.material ? [{ quantity: s.quantity != null ? String(s.quantity) : '', material_name: s.material }] : [];

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={tdStyle}>{formatDate(s.ship_date)}</td>
      <td style={tdStyle}>
        {s.delivery_date
          ? formatDate(s.delivery_date)
          : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>TBD</span>}
      </td>
      <td style={tdStyle}>{s.customer_name}</td>
      <td style={tdStyle}>{s.city}{s.state ? `, ${s.state}` : ''}</td>
      <td style={tdStyle}>
        <div style={{ maxWidth: '180px' }}>
          {matItems.map((m, i) => (
            <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.quantity ? `${m.quantity} ` : ''}{m.material_name}
            </div>
          ))}
        </div>
      </td>
      <td style={tdStyle}>{s.po_number}</td>
      <td style={tdStyle}>{s.carrier_name}</td>
      <td style={tdStyle}>{s.tracking_number}</td>
      <td style={{
        ...tdStyle,
        color: s.trailer_type === 'Hotshot' ? 'var(--accent-danger)' : 'var(--text-primary)',
        fontWeight: s.trailer_type === 'Hotshot' ? 700 : 400,
      }}>
        {s.trailer_type || ''}
      </td>
      <td style={tdStyle}>{s.weight}</td>
      <td style={tdStyle}>
        <StatusBadge status={s.status} isWarehouse={false} />
      </td>
      <td style={tdStyle}>{formatTimestamp(s.archived_at)}</td>
      <td style={tdStyle}>{s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}</td>

      <PODCell shipment={s} isWarehouse={isWarehouse} onPodUpdate={onPodUpdate} />

      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
        {!isWarehouse && (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <button
              onClick={() => onUnarchive(s)}
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
            <span style={{
              display: 'inline-block', width: '1px', height: '16px',
              background: 'var(--border)', margin: '0 6px', flexShrink: 0,
            }} />
            <button
              onClick={() => onDelete(s)}
              style={{
                background: 'none', border: 'none',
                color: '#FF1744',
                cursor: 'pointer', fontSize: '12px',
                fontWeight: 600, padding: '4px 8px',
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}
            >
              <TrashIcon />
              Delete
            </button>
          </span>
        )}
      </td>
    </tr>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
      <span style={{ color: 'var(--text-secondary)', minWidth: '72px' }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}

function TrashIcon() {
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

const tdStyle = {
  padding: '10px 10px',
  color: 'var(--text-primary)',
  fontSize: '13px',
};

const thStyle = {
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
