'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import ShipmentTable from './ShipmentTable';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';
import { formatDate } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthKey(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7); // "2026-04"
}

function monthLabel(key, currentKey) {
  if (key === currentKey) return 'This Month';
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ShipmentHistory({
  fetchAllShipments,
  restoreShipment,
  archiveShipment,
  unarchiveShipment,
  sortConfig,
  onSort,
  searchQuery,
  isWarehouse,
  flashedId,
  expandedId,
  onToggleExpand,
  renderActivityLog,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) {
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historySubTab, setHistorySubTab] = useState('history'); // 'history' | 'archive'
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());
  const [confirmArchive, setConfirmArchive] = useState(null); // shipment or null
  const [archivePage, setArchivePage] = useState(1);
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const initDoneRef = useRef(false);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAllShipments().then(data => {
      if (mounted) {
        // History shows delivered + soft-deleted records
        setAllShipments(data.filter(s => s.status === 'Delivered' || s.deleted_at));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [fetchAllShipments]);

  const searchFields = [
    'customer_name', 'city', 'state', 'material', 'po_number',
    'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type',
  ];

  const applyFilters = (list) => {
    let result = list;
    if (searchQuery.trim()) {
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
    return result;
  };

  // History sub-tab: non-archived records
  const historyShipments = useMemo(() => {
    const base = allShipments.filter(s => !s.archived_at);
    return applyFilters(base).sort((a, b) => {
      if ((a.ship_date || '') > (b.ship_date || '')) return -1;
      if ((a.ship_date || '') < (b.ship_date || '')) return 1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allShipments, searchQuery, dateFrom, dateTo]);

  // Group by month
  const monthGroups = useMemo(() => {
    const groups = {};
    for (const s of historyShipments) {
      const key = getMonthKey(s.ship_date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [historyShipments]);

  // Init collapsed: most recent expanded, rest collapsed
  useEffect(() => {
    if (!initDoneRef.current && monthGroups.length > 0) {
      initDoneRef.current = true;
      setCollapsedMonths(new Set(monthGroups.slice(1).map(([key]) => key)));
    }
  }, [monthGroups]);

  const toggleMonth = (key) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Archive sub-tab: archived_at IS NOT NULL
  const archiveShipments = useMemo(() => {
    const base = allShipments.filter(s => !!s.archived_at);
    return applyFilters(base).sort((a, b) => {
      // Sort by archived_at desc
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

  const handleArchiveClick = (shipment) => setConfirmArchive(shipment);

  const confirmDoArchive = async () => {
    if (!confirmArchive || !archiveShipment) return;
    try {
      await archiveShipment(confirmArchive.id);
      const now = new Date().toISOString();
      setAllShipments(prev =>
        prev.map(s => s.id === confirmArchive.id ? { ...s, archived_at: now } : s)
      );
    } finally {
      setConfirmArchive(null);
    }
  };

  const handleUnarchive = async (shipment) => {
    if (!unarchiveShipment) return;
    await unarchiveShipment(shipment.id);
    setAllShipments(prev =>
      prev.map(s => s.id === shipment.id ? { ...s, archived_at: null } : s)
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading history...
      </div>
    );
  }

  const historyCount = historyShipments.length;
  const archiveCount = archiveShipments.length;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="no-print" style={{
        display: 'flex',
        borderBottom: '2px solid var(--border)',
        padding: '0 24px',
      }}>
        {[
          { key: 'history', label: `History (${historyCount})` },
          { key: 'archive', label: `Archive (${archiveCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setHistorySubTab(tab.key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: historySubTab === tab.key
                ? '2px solid var(--accent-green)'
                : '2px solid transparent',
              marginBottom: '-2px',
              color: historySubTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: historySubTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date range pickers */}
      <div className="no-print" style={{
        display: 'flex', gap: '12px', padding: '12px 24px',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>From:</label>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} style={dateInputStyle} />
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>To:</label>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} style={dateInputStyle} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {historySubTab === 'history' ? historyCount : archiveCount} record{(historySubTab === 'history' ? historyCount : archiveCount) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Archive confirmation dialog */}
      {confirmArchive && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '28px 32px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>
              Archive Shipment?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
              Are you sure you want to remove PO#{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {confirmArchive.po_number || '—'}
              </strong>{' '}
              from History? It can be recovered from the Archive.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmArchive(null)}
                style={{ ...dialogBtn, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDoArchive}
                style={{ ...dialogBtn, background: 'var(--accent-danger)', color: '#fff', border: 'none' }}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History sub-tab: grouped by month ── */}
      {historySubTab === 'history' && (
        historyShipments.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No history records found.
          </div>
        ) : (
          monthGroups.map(([key, rows]) => {
            const isCollapsed = collapsedMonths.has(key);
            const label = monthLabel(key, currentMonthKey);
            return (
              <div key={key}>
                <div
                  onClick={() => toggleMonth(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    userSelect: 'none',
                  }}
                >
                  <span style={{
                    fontSize: '11px', color: 'var(--text-secondary)',
                    display: 'inline-block',
                    transform: isCollapsed ? 'none' : 'rotate(90deg)',
                    transition: 'transform 0.2s',
                  }}>▶</span>
                  <span style={{
                    fontFamily: 'var(--font-heading), Oswald, sans-serif',
                    fontWeight: 700, fontSize: '14px',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    — {rows.length} shipment{rows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {!isCollapsed && (
                  <ShipmentTable
                    shipments={rows}
                    sortConfig={sortConfig}
                    onSort={onSort}
                    onEdit={() => {}}
                    onDelete={!isWarehouse ? handleArchiveClick : () => {}}
                    onStatusChange={() => {}}
                    isWarehouse={isWarehouse}
                    flashedId={flashedId}
                    expandedId={expandedId}
                    onToggleExpand={onToggleExpand}
                    renderActivityLog={renderActivityLog}
                    getUrgencyClass={() => null}
                    tableMode="history"
                  />
                )}
              </div>
            );
          })
        )
      )}

      {/* ── Archive sub-tab ── */}
      {historySubTab === 'archive' && (
        archiveShipments.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No archived records.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Ship Date', 'Del. Date', 'Customer', 'City/State', 'Materials', 'PO#', 'Carrier', 'Trailer Type', 'Weight', 'Status', 'Archived On', 'Price', 'Actions'].map(h => (
                      <th key={h} style={archiveThStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedArchive.map(s => {
                    const matItems = s.shipment_materials && s.shipment_materials.length > 0
                      ? s.shipment_materials
                      : s.material ? [{ quantity: s.quantity != null ? String(s.quantity) : '', material_name: s.material }] : [];
                    const materialsStr = matItems.map(m => `${m.quantity ? m.quantity + ' ' : ''}${m.material_name}`).join(' / ');
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
                        <td style={{ ...archiveTdStyle, whiteSpace: 'nowrap' }}>
                          {!isWarehouse && (
                            <button
                              onClick={() => handleUnarchive(s)}
                              style={{
                                background: 'none', border: 'none',
                                color: 'var(--accent-delivered)',
                                cursor: 'pointer', fontSize: '12px',
                                fontWeight: 600, padding: '4px 8px',
                              }}
                            >
                              Unarchive
                            </button>
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
        )
      )}
    </div>
  );
}

function ArchiveCell({ children }) {
  return <td style={archiveTdStyle}>{children ?? ''}</td>;
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
  color: 'var(--text-secondary)',
  background: 'var(--bg-surface)',
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

const dialogBtn = {
  padding: '10px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};
