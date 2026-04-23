'use client';
import { useState, useMemo, useCallback } from 'react';
import { useShipments } from '../hooks/useShipments';
import { BADGE_COLORS, DEFAULT_ROWS_PER_PAGE } from '../lib/constants';
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

const SEARCH_FIELDS = ['customer_name', 'city', 'state', 'material', 'po_number', 'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type', 'loading_building'];

function applySearch(list, query) {
  if (!query.trim()) return list;
  const q = query.toLowerCase();
  return list.filter(s => {
    const direct = SEARCH_FIELDS.some(f => s[f] && String(s[f]).toLowerCase().includes(q));
    const mats = s.shipment_materials && s.shipment_materials.some(m =>
      (m.material_name && m.material_name.toLowerCase().includes(q)) ||
      (m.quantity && String(m.quantity).toLowerCase().includes(q))
    );
    return direct || mats;
  });
}

function applySort(list, sortConfig) {
  return [...list].sort((a, b) => {
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
}

export default function Home() {
  const {
    allShipments, loading, searchQuery, setSearchQuery,
    sortConfig, handleSort, flashedId,
    createShipment, updateShipment, deleteShipment, restoreShipment,
    archiveShipment, unarchiveShipment, archiveAllDelivered,
    checkDuplicatePO, fetchAllShipments,
  } = useShipments();

  const [formOpen, setFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [activeStatusFilter, setActiveStatusFilter] = useState(null); // 'Pending'|'Booked'|'In Transit'|null
  const [expandedId, setExpandedId] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [activeRowsPerPage, setActiveRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [deliveredPage, setDeliveredPage] = useState(1);
  const [deliveredRowsPerPage, setDeliveredRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [recentlyChangedId, setRecentlyChangedId] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  // Active: non-Delivered, optionally filtered by status, search-filtered, sorted
  const sortedActive = useMemo(() => {
    let result = allShipments.filter(s => s.status !== 'Delivered');
    if (activeStatusFilter) result = result.filter(s => s.status === activeStatusFilter);
    result = applySearch(result, searchQuery);
    return applySort(result, sortConfig);
  }, [allShipments, activeStatusFilter, searchQuery, sortConfig]);

  // Delivered: status === 'Delivered' AND not archived, search-filtered, sorted
  const sortedDelivered = useMemo(() => {
    let result = allShipments.filter(s => s.status === 'Delivered' && !s.archived_at);
    result = applySearch(result, searchQuery);
    return applySort(result, sortConfig);
  }, [allShipments, searchQuery, sortConfig]);

  const paginatedActive = useMemo(() => {
    const start = (activePage - 1) * activeRowsPerPage;
    return sortedActive.slice(start, start + activeRowsPerPage);
  }, [sortedActive, activePage, activeRowsPerPage]);

  const paginatedDelivered = useMemo(() => {
    const start = (deliveredPage - 1) * deliveredRowsPerPage;
    return sortedDelivered.slice(start, start + deliveredRowsPerPage);
  }, [sortedDelivered, deliveredPage, deliveredRowsPerPage]);

  // Dashboard card click → navigate to correct tab + set optional status filter
  const handleCardClick = useCallback((key) => {
    if (key === 'delivered') {
      setActiveTab('delivered');
      setActiveStatusFilter(null);
    } else if (key === 'total') {
      setActiveTab('active');
      setActiveStatusFilter(null);
    } else {
      const statusMap = { pending: 'Pending', booked: 'Booked', 'in-transit': 'In Transit' };
      setActiveTab('active');
      setActiveStatusFilter(statusMap[key] || null);
    }
    setActivePage(1);
    setDeliveredPage(1);
  }, []);

  const handleAddShipment = () => { setEditingShipment(null); setFormOpen(true); };
  const handleEdit = (s) => { setEditingShipment(s); setFormOpen(true); };

  const handleSave = async (payload, editId) => {
    if (editId) await updateShipment(editId, payload);
    else await createShipment(payload);
  };

  const handleDelete = async (s) => { await deleteShipment(s.id); };

  const handleStatusChange = useCallback(async (id, newStatus) => {
    await updateShipment(id, { status: newStatus });
    setRecentlyChangedId(id);
    setTimeout(() => setRecentlyChangedId(null), 1500);
  }, [updateShipment]);

  const handleArchive = useCallback(async (s) => { await archiveShipment(s.id); }, [archiveShipment]);
  const handleToggleExpand = useCallback((id) => { setExpandedId(prev => prev === id ? null : id); }, []);
  const getUrgencyClass = useCallback((shipment) => getUrgencyLevel(shipment), []);
  const renderActivityLog = useCallback((shipmentId) => <ActivityLog shipmentId={shipmentId} isWarehouse={false} />, []);
  const handlePrint = () => window.print();
  const handleExport = () => exportToCSV(activeTab === 'delivered' ? sortedDelivered : sortedActive);
  const handleSearchChange = (q) => { setSearchQuery(q); setActivePage(1); setDeliveredPage(1); };
  const handleTabChange = (tab) => { setActiveTab(tab); if (tab !== 'active') setActiveStatusFilter(null); };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleArchiveAllDelivered = async () => {
    try {
      const count = await archiveAllDelivered();
      setArchiveConfirm(false);
      showToast(`${count} shipment${count !== 1 ? 's' : ''} archived to History`);
    } catch (err) {
      setArchiveConfirm(false);
      showToast(`Archive failed: ${err.message}`);
    }
  };

  const combinedFlashId = recentlyChangedId || flashedId;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)', fontSize: '18px' }}>
        Loading shipments...
      </div>
    );
  }

  // Badge colors for the active filter chip
  const filterChipColor = activeStatusFilter ? (BADGE_COLORS[activeStatusFilter] || { bg: '#6b7280', text: '#fff' }) : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1100,
          background: 'var(--accent-green)', color: '#fff',
          padding: '14px 22px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(74,124,63,0.4)',
          animation: 'fade-in 0.3s ease-out',
        }}>
          {toast}
        </div>
      )}

      {/* Archive All Delivered confirmation modal */}
      {archiveConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '28px 32px', maxWidth: '420px', width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>
              Archive All Delivered?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
              This will move <strong style={{ color: 'var(--text-primary)' }}>{sortedDelivered.length} shipment{sortedDelivered.length !== 1 ? 's' : ''}</strong> to History. They can be recovered from the History tab.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setArchiveConfirm(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveAllDelivered}
                style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: 'var(--accent-green)', color: '#fff', border: 'none' }}
              >
                Archive All
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        onAddShipment={handleAddShipment}
        onPrint={handlePrint}
        onExport={handleExport}
        isWarehouse={false}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <DashboardSummary
        shipments={allShipments}
        isWarehouse={false}
        onCardClick={handleCardClick}
      />

      {activeTab !== 'history' && (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalCount={activeTab === 'delivered' ? sortedDelivered.length : sortedActive.length}
          filteredCount={activeTab === 'delivered' ? sortedDelivered.length : sortedActive.length}
          isWarehouse={false}
        />
      )}

      {/* Active status filter chip */}
      {activeTab === 'active' && activeStatusFilter && (
        <div className="no-print" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 24px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filtered by:</span>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            background: filterChipColor.bg, color: filterChipColor.text,
          }}>
            {activeStatusFilter}
          </span>
          <button
            onClick={() => setActiveStatusFilter(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}
          >
            × Show all
          </button>
        </div>
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
              statusChangedId={recentlyChangedId}
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
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px' }}>
              <button
                onClick={() => setArchiveConfirm(true)}
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: '1px solid var(--accent-danger)',
                  background: 'transparent', color: 'var(--accent-danger)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Archive All Delivered
              </button>
            </div>
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
              statusChangedId={recentlyChangedId}
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
          unarchiveShipment={unarchiveShipment}
          searchQuery={searchQuery}
          isWarehouse={false}
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
