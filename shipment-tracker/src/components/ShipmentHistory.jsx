'use client';
import { useState, useEffect, useMemo } from 'react';
import ShipmentTable from './ShipmentTable';
import Pagination from './Pagination';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';

export default function ShipmentHistory({
  fetchAllShipments,
  restoreShipment,
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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAllShipments().then(data => {
      if (mounted) {
        // History shows delivered + soft-deleted
        setAllShipments(data.filter(s => s.status === 'Delivered' || s.deleted_at));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [fetchAllShipments]);

  const searchFields = ['customer_name', 'city', 'state', 'material', 'po_number', 'carrier_name', 'tracking_number', 'special_instructions'];

  const filtered = useMemo(() => {
    let result = allShipments;

    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => searchFields.some(f => s[f] && String(s[f]).toLowerCase().includes(q)));
    }
    if (dateFrom) {
      result = result.filter(s => s.ship_date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(s => s.ship_date <= dateTo);
    }

    // Sort
    return [...result].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allShipments, statusFilter, searchQuery, dateFrom, dateTo, sortConfig]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleRestore = async (shipment) => {
    await restoreShipment(shipment.id);
    setAllShipments(prev => prev.filter(s => s.id !== shipment.id));
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading history...</div>;
  }

  return (
    <div>
      {/* Date range pickers */}
      <div className="no-print" style={{
        display: 'flex', gap: '12px', padding: '12px 24px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>From:</label>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} style={dateInputStyle} />
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>To:</label>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} style={dateInputStyle} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No history records found.
        </div>
      ) : (
        <>
          <ShipmentTable
            shipments={paginated}
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
            isHistory={true}
          />
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={p => { setRowsPerPage(p); setPage(1); }}
          />
        </>
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
