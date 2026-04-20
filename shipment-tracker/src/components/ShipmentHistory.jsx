'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import ShipmentTable from './ShipmentTable';
import Pagination from './Pagination';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';

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

export default function ShipmentHistory({
  fetchAllShipments,
  restoreShipment,
  archiveShipment,
  unarchiveShipment,
  sortConfig,
  onSort,
  searchQuery,
  statusFilter,
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
    if (statusFilter !== 'All') result = result.filter(s => s.status === statusFilter);
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
    if (dateTo) result = result.filter(s => s.ship_date <= dateTo);
    return result;
  };

  // History sub-tab: non-archived records
  const historyShipments = useMemo(() => {
    const base = allShipments.filter(s => !s.archived);
    return applyFilters(base).sort((a, b) => {
      if ((a.ship_date || '') > (b.ship_date || '')) return -1;
      if ((a.ship_date || '') < (b.ship_date || '')) return 1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allShipments, statusFilter, searchQuery, dateFrom, dateTo]);

  // Group by month for History sub-tab
  const monthGroups = useMemo(() => {
    const groups = {};
    for (const s of historyShipments) {
      const key = getMonthKey(s.ship_date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [historyShipments]);

  // Initialize collapse state once: most recent month expanded, rest collapsed
  useEffect(() => {
    if (!initDoneRef.current && monthGroups.length > 0) {
      initDoneRef.current = true;
      const toCollapse = new Set(
        monthGroups.slice(1).map(([key]) => key)
      );
      setCollapsedMonths(toCollapse);
    }
  }, [monthGroups]);

  const toggleMonth = (key) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Archive sub-tab: archived records
  const archiveShipments = useMemo(() => {
    const base = allShipments.filter(s => s.archived === true);
    return applyFilters(base).sort((a, b) => {
      if ((a.ship_date || '') > (b.ship_date || '')) return -1;
      if ((a.ship_date || '') < (b.ship_date || '')) return 1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allShipments, statusFilter, searchQuery, dateFrom, dateTo]);

  const paginatedArchive = useMemo(() => {
    const start = (archivePage - 1) * archiveRowsPerPage;
    return archiveShipments.slice(start, start + archiveRowsPerPage);
  }, [archiveShipments, archivePage, archiveRowsPerPage]);

  // Archive a history row (move to Archive tab)
  const handleArchiveClick = (shipment) => {
    setConfirmArchive(shipment);
  };

  const confirmDoArchive = async () => {
    if (!confirmArchive || !archiveShipment) return;
    try {
      await archiveShipment(confirmArchive.id);
      setAllShipments(prev =>
        prev.map(s => s.id === confirmArchive.id ? { ...s, archived: true } : s)
      );
    } finally {
      setConfirmArchive(null);
    }
  };

  // Restore an archived row (move back to History tab)
  const handleRestore = async (shipment) => {
    if (!unarchiveShipment) return;
    await unarchiveShipment(shipment.id);
    setAllShipments(prev =>
      prev.map(s => s.id === shipment.id ? { ...s, archived: false } : s)
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
  const activeCount = historySubTab === 'history' ? historyCount : archiveCount;

  return (
    <div>
      {/* Sub-tabs: History | Archive */}
      <div className="no-print" style={{
        display: 'flex', gap: '0',
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
        <input
          type="date"
          value={dateFrom}
          onChange={e => onDateFromChange(e.target.value)}
          style={dateInputStyle}
        />
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>To:</label>
        <input
          type="date"
          value={dateTo}
          onChange={e => onDateToChange(e.target.value)}
          style={dateInputStyle}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {activeCount} record{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Confirm Archive Dialog */}
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
                style={{
                  ...dialogBtn,
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDoArchive}
                style={{
                  ...dialogBtn,
                  background: 'var(--accent-danger)',
                  color: '#fff',
                  border: 'none',
                }}
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
                {/* Month section header */}
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
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'inline-block',
                    transform: isCollapsed ? 'none' : 'rotate(90deg)',
                    transition: 'transform 0.2s',
                  }}>
                    ▶
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-heading), Oswald, sans-serif',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    — {rows.length} shipment{rows.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Rows for this month */}
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
            <ShipmentTable
              shipments={paginatedArchive}
              sortConfig={sortConfig}
              onSort={onSort}
              onEdit={() => {}}
              onDelete={!isWarehouse ? handleRestore : () => {}}
              onStatusChange={() => {}}
              isWarehouse={isWarehouse}
              flashedId={flashedId}
              expandedId={expandedId}
              onToggleExpand={onToggleExpand}
              renderActivityLog={renderActivityLog}
              getUrgencyClass={() => null}
              tableMode="trash"
            />
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
