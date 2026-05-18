'use client';
import { useState, useMemo, useCallback } from 'react';
import { useOrders } from '../hooks/useOrders';
import { ORDER_TYPES } from '../lib/constants';
import Header from '../components/Header';
import DashboardSummary from '../components/DashboardSummary';
import OrderTable from '../components/OrderTable';
import OrderForm from '../components/OrderForm';
import ActivityLog from '../components/ActivityLog';
import EmptyState from '../components/EmptyState';

function exportToCSV(orders) {
  const headers = [
    'Start Date', 'Due Date', 'Customer', 'PO#', 'Qty', 'Pvg"',
    'Dowel Size', 'O.C.', 'Coating', '# of Dowels', '# Total LF',
    'Status', 'CPU ASAP', 'Order Type',
  ];
  const formatDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${m}/${day}/${y}`;
  };
  const rows = orders.map(o => [
    formatDate(o.start_date), formatDate(o.due_date),
    o.customer, o.po_number || '', o.quantity ?? '', o.pvg || '',
    o.dowel_size || '', o.oc || '',
    o.coating === 'Other' ? `Other: ${o.coating_other || ''}` : (o.coating || ''),
    o.num_dowels ?? '', o.total_lf ?? '', o.status,
    o.cpu_asap ? 'Yes' : 'No', o.order_type,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `production-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const { orders, loading, flashedId, createOrder, updateOrder, archiveOrder, unarchiveOrder, deleteOrder } = useOrders();

  const [activeTab, setActiveTab] = useState('Baskets');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'history'
  const [statusFilter, setStatusFilter] = useState(null); // null | status key | 'total'
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Switching product tabs resets view mode and filter
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setViewMode('active');
    setStatusFilter(null);
    setExpandedId(null);
  }, []);

  // Tab counts for header badges: active (non-cancelled, non-archived) per type
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const type of ORDER_TYPES) {
      counts[type] = orders.filter(
        o => o.order_type === type && o.status !== 'Cancelled' && !o.archived
      ).length;
    }
    return counts;
  }, [orders]);

  // Active orders for current tab — CPU ASAP pinned, then due date asc
  const activeOrders = useMemo(() => {
    const base = orders.filter(o => o.order_type === activeTab && !o.archived && o.status !== 'Cancelled');
    const cpu = base.filter(o => o.cpu_asap).sort((a, b) => (a.due_date ?? '') < (b.due_date ?? '') ? -1 : 1);
    const rest = base.filter(o => !o.cpu_asap).sort((a, b) => (a.due_date ?? '') < (b.due_date ?? '') ? -1 : 1);
    return [...cpu, ...rest];
  }, [orders, activeTab]);

  // History orders for current tab (archived or cancelled)
  const historyOrders = useMemo(() => {
    return orders
      .filter(o => o.order_type === activeTab && (o.archived || o.status === 'Cancelled'))
      .sort((a, b) => (a.due_date ?? '') < (b.due_date ?? '') ? -1 : 1);
  }, [orders, activeTab]);

  // Apply status filter (Feature 1) — 'total' or null means show all
  const visibleOrders = useMemo(() => {
    if (viewMode === 'history') return historyOrders;
    if (!statusFilter || statusFilter === 'total') return activeOrders;
    return activeOrders.filter(o => o.status === statusFilter);
  }, [activeOrders, historyOrders, statusFilter, viewMode]);

  const handleStatusFilter = useCallback((key) => {
    setStatusFilter(key);
    setExpandedId(null);
  }, []);

  const handleAddOrder = () => { setEditingOrder(null); setFormOpen(true); };
  const handleEdit = useCallback((order) => { setEditingOrder(order); setFormOpen(true); }, []);
  const handleToggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleSave = async (payload, editId, prevOrder) => {
    if (editId) {
      await updateOrder(editId, payload, prevOrder);
      showToast('Order updated');
    } else {
      await createOrder(payload);
      showToast('Order added');
    }
  };

  const handleStatusChange = useCallback(async (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    const updates = {
      status: newStatus,
      ...(newStatus === 'Cancelled' ? { archived: true } : {}),
    };
    try {
      await updateOrder(id, updates, order);
      showToast(newStatus === 'Cancelled' ? 'Order cancelled & archived' : `Status → ${newStatus}`);
    } catch (err) {
      // StatusDropdown reverts the badge optimistically; surface the error
      setDeleteError(`Status update failed: ${err.message}`);
      setTimeout(() => setDeleteError(null), 5000);
      throw err; // re-throw so StatusDropdown can revert local state
    }
  }, [orders, updateOrder]);

  const handleArchive = useCallback(async (order) => {
    try {
      await archiveOrder(order.id, order.customer);
      if (expandedId === order.id) setExpandedId(null);
      showToast('Order archived');
    } catch (err) {
      setDeleteError(`Archive failed: ${err.message}`);
      setTimeout(() => setDeleteError(null), 5000);
    }
  }, [archiveOrder, expandedId]);

  const handleRestore = useCallback(async (order) => {
    try {
      await unarchiveOrder(order.id);
      showToast('Order restored to active');
    } catch (err) {
      setDeleteError(`Restore failed: ${err.message}`);
      setTimeout(() => setDeleteError(null), 5000);
    }
  }, [unarchiveOrder]);

  const handleDelete = useCallback(async (order) => {
    try {
      await deleteOrder(order.id);
      if (expandedId === order.id) setExpandedId(null);
      showToast('Order permanently deleted');
    } catch (err) {
      setDeleteError(`Delete failed: ${err.message}`);
      setTimeout(() => setDeleteError(null), 5000);
    }
  }, [deleteOrder, expandedId]);

  const handleExport = () => exportToCSV(viewMode === 'active' ? visibleOrders : historyOrders);

  const renderActivityLog = useCallback((orderId) => (
    <ActivityLog orderId={orderId} />
  ), []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--text-secondary)', fontSize: '18px',
      }}>
        Loading orders…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 999,
          background: '#68b857', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(104,184,87,0.4)',
        }}>
          {toast}
        </div>
      )}
      {deleteError && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 999,
          background: '#ef4444', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 600,
        }}>
          {deleteError}
        </div>
      )}

      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabCounts={tabCounts}
        onAddOrder={handleAddOrder}
        onExport={handleExport}
      />

      <DashboardSummary
        orders={orders}
        activeTab={activeTab}
        statusFilter={statusFilter}
        onStatusFilter={handleStatusFilter}
      />

      {/* Active / History sub-tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
      }}>
        {['active', 'history'].map(mode => (
          <button
            key={mode}
            onClick={() => { setViewMode(mode); setExpandedId(null); }}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: viewMode === mode ? '2px solid var(--accent-green)' : '2px solid transparent',
              color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: viewMode === mode ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-1px',
              textTransform: 'capitalize',
              letterSpacing: '0.3px',
            }}
          >
            {mode === 'active' ? 'Active' : 'History'}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              ({mode === 'active' ? activeOrders.length : historyOrders.length})
            </span>
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <EmptyState
          tabLabel={activeTab}
          onAdd={viewMode === 'active' ? handleAddOrder : null}
          isHistory={viewMode === 'history'}
          hasFilter={viewMode === 'active' && !!statusFilter && statusFilter !== 'total'}
        />
      ) : (
        <OrderTable
          orders={visibleOrders}
          flashedId={flashedId}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          renderActivityLog={renderActivityLog}
          isHistory={viewMode === 'history'}
        />
      )}

      <OrderForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingOrder(null); }}
        onSave={handleSave}
        editingOrder={editingOrder}
      />
    </div>
  );
}
