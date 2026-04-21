'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useShipments } from '../hooks/useShipments';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';
import { getUrgencyLevel } from '../components/UrgencyBadge';
import { exportToCSV } from '../components/ExportCSV';
import Header from '../components/Header';
import DashboardSummary from '../components/DashboardSummary';
import SearchFilterBar from '../components/SearchFilterBar';
import ShipmentTable from '../components/ShipmentTable';
import ShipmentForm from '../components/ShipmentForm';
import ShipmentHistory from '../components/ShipmentHistory';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ActivityLog from '../components/ActivityLog';
import PrintView from '../components/PrintView';

export default function Home() {
  const {
    shipments, allShipments, loading, searchQuery, setSearchQuery,
    statusFilter, setStatusFilter, sortConfig, handleSort, flashedId,
    createShipment, updateShipment, deleteShipment, restoreShipment,
    archiveShipment, unarchiveShipment,
    checkDuplicatePO, fetchShipments, fetchAllShipments,
  } = useShipments();

  const [formOpen, setFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const paginatedShipments = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return shipments.slice(start, start + rowsPerPage);
  }, [shipments, page, rowsPerPage]);

  const statusCounts = useMemo(() => ({
    Pending:      allShipments.filter(s => s.status === 'Pending').length,
    Booked:       allShipments.filter(s => s.status === 'Booked').length,
    'In Transit': allShipments.filter(s => s.status === 'In Transit').length,
    Delivered:    allShipments.filter(s => s.status === 'Delivered').length,
  }), [allShipments]);

  const handleAddShipment = () => { setEditingShipment(null); setFormOpen(true); };
  const handleEdit = (s) => { setEditingShipment(s); setFormOpen(true); };

  const handleSave = async (payload, editId) => {
    if (editId) {
      await updateShipment(editId, payload);
    } else {
      await createShipment(payload);
    }
  };

  const handleDelete = async (s) => { await deleteShipment(s.id); };
  const handleStatusChange = async (id, newStatus) => { await updateShipment(id, { status: newStatus }); };
  const handleArchive = useCallback(async (s) => { await archiveShipment(s.id); }, [archiveShipment]);
  const handleToggleExpand = useCallback((id) => { setExpandedId(prev => prev === id ? null : id); }, []);
  const getUrgencyClass = useCallback((shipment) => getUrgencyLevel(shipment), []);
  const renderActivityLog = useCallback((shipmentId) => <ActivityLog shipmentId={shipmentId} isWarehouse={false} />, []);
  const handlePrint = () => window.print();
  const handleExport = () => exportToCSV(shipments);
  const handleSearchChange = (q) => { setSearchQuery(q); setPage(1); };
  const handleStatusFilterChange = (s) => { setStatusFilter(s); setPage(1); };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)', fontSize: '18px' }}>
        Loading shipments...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onAddShipment={handleAddShipment}
        onPrint={handlePrint}
        onExport={handleExport}
        isWarehouse={false}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <DashboardSummary shipments={allShipments} isWarehouse={false} />

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        totalCount={allShipments.length}
        filteredCount={shipments.length}
        statusCounts={statusCounts}
        isWarehouse={false}
      />

      {activeTab === 'active' ? (
        <>
          {shipments.length === 0 ? (
            <EmptyState isWarehouse={false} />
          ) : (
            <>
              <ShipmentTable
                shipments={paginatedShipments}
                sortConfig={sortConfig}
                onSort={handleSort}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onStatusChange={handleStatusChange}
                isWarehouse={false}
                flashedId={flashedId}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                renderActivityLog={renderActivityLog}
                getUrgencyClass={getUrgencyClass}
              />
              <Pagination
                currentPage={page}
                totalItems={shipments.length}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={p => { setRowsPerPage(p); setPage(1); }}
              />
            </>
          )}
        </>
      ) : (
        <ShipmentHistory
          fetchAllShipments={fetchAllShipments}
          restoreShipment={restoreShipment}
          archiveShipment={archiveShipment}
          unarchiveShipment={unarchiveShipment}
          sortConfig={sortConfig}
          onSort={handleSort}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          isWarehouse={false}
          flashedId={flashedId}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          renderActivityLog={renderActivityLog}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      )}

      <PrintView
        shipments={shipments}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        totalCount={allShipments.length}
      />

      <ShipmentForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingShipment(null); }}
        onSave={handleSave}
        editingShipment={editingShipment}
        onDelete={handleDelete}
        checkDuplicatePO={checkDuplicatePO}
      />
    </div>
  );
}
