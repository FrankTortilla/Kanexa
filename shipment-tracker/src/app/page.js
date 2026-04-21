'use client';
import { useState, useMemo, useCallback } from 'react';
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
    allShipments, loading, searchQuery, setSearchQuery,
    sortConfig, handleSort, flashedId,
    createShipment, updateShipment, deleteShipment, restoreShipment,
    archiveShipment, unarchiveShipment,
    checkDuplicatePO, fetchAllShipments,
  } = useShipments();

  const [formOpen, setFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedId, setExpandedId] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [activeRowsPerPage, setActiveRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [deliveredPage, setDeliveredPage] = useState(1);
  const [deliveredRowsPerPage, setDeliveredRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Active: non-Delivered, search-filtered
  const activeShipments = useMemo(() => {
    let result = allShipments.filter(s => s.status !== 'Delivered');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = ['customer_name', 'city', 'state', 'material', 'po_number', 'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type', 'loading_building'];
      result = result.filter(s => {
        const direct = fields.some(f => s[f] && String(s[f]).toLowerCase().includes(q));
        const mats = s.shipment_materials && s.shipment_materials.some(m =>
          (m.material_name && m.material_name.toLowerCase().includes(q)) ||
          (m.quantity && String(m.quantity).toLowerCase().includes(q))
        );
        return direct || mats;
      });
    }
    return result;
  }, [allShipments, searchQuery]);

  // Delivered: status === 'Delivered', search-filtered
  const deliveredShipments = useMemo(() => {
    let result = allShipments.filter(s => s.status === 'Delivered');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = ['customer_name', 'city', 'state', 'material', 'po_number', 'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type', 'loading_building'];
      result = result.filter(s => {
        const direct = fields.some(f => s[f] && String(s[f]).toLowerCase().includes(q));
        const mats = s.shipment_materials && s.shipment_materials.some(m =>
          (m.material_name && m.material_name.toLowerCase().includes(q)) ||
          (m.quantity && String(m.quantity).toLowerCase().includes(q))
        );
        return direct || mats;
      });
    }
    return result;
  }, [allShipments, searchQuery]);

  // Sorted active + delivered lists
  const sortedActive = useMemo(() => {
    return [...activeShipments].sort((a, b) => {
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
  }, [activeShipments, sortConfig]);

  const sortedDelivered = useMemo(() => {
    return [...deliveredShipments].sort((a, b) => {
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
  }, [deliveredShipments, sortConfig]);

  const paginatedActive = useMemo(() => {
    const start = (activePage - 1) * activeRowsPerPage;
    return sortedActive.slice(start, start + activeRowsPerPage);
  }, [sortedActive, activePage, activeRowsPerPage]);

  const paginatedDelivered = useMemo(() => {
    const start = (deliveredPage - 1) * deliveredRowsPerPage;
    return sortedDelivered.slice(start, start + deliveredRowsPerPage);
  }, [sortedDelivered, deliveredPage, deliveredRowsPerPage]);

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
  const handleExport = () => exportToCSV(activeTab === 'delivered' ? sortedDelivered : sortedActive);
  const handleSearchChange = (q) => { setSearchQuery(q); setActivePage(1); setDeliveredPage(1); };

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

      {activeTab !== 'history' && (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalCount={activeTab === 'delivered' ? deliveredShipments.length : activeShipments.length}
          filteredCount={activeTab === 'delivered' ? sortedDelivered.length : sortedActive.length}
          isWarehouse={false}
        />
      )}

      {activeTab === 'active' && (
        sortedActive.length === 0 ? (
          <EmptyState isWarehouse={false} />
        ) : (
          <>
            <ShipmentTable
              shipments={paginatedActive}
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
              currentPage={activePage}
              totalItems={sortedActive.length}
              rowsPerPage={activeRowsPerPage}
              onPageChange={setActivePage}
              onRowsPerPageChange={p => { setActiveRowsPerPage(p); setActivePage(1); }}
            />
          </>
        )
      )}

      {activeTab === 'delivered' && (
        sortedDelivered.length === 0 ? (
          <EmptyState isWarehouse={false} />
        ) : (
          <>
            <ShipmentTable
              shipments={paginatedDelivered}
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
              currentPage={deliveredPage}
              totalItems={sortedDelivered.length}
              rowsPerPage={deliveredRowsPerPage}
              onPageChange={setDeliveredPage}
              onRowsPerPageChange={p => { setDeliveredRowsPerPage(p); setDeliveredPage(1); }}
            />
          </>
        )
      )}

      {activeTab === 'history' && (
        <ShipmentHistory
          fetchAllShipments={fetchAllShipments}
          restoreShipment={restoreShipment}
          archiveShipment={archiveShipment}
          unarchiveShipment={unarchiveShipment}
          sortConfig={sortConfig}
          onSort={handleSort}
          searchQuery={searchQuery}
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
        shipments={activeTab === 'delivered' ? sortedDelivered : sortedActive}
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
