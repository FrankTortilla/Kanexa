'use client';
import { useState, useMemo, useCallback } from 'react';
import { useOrders } from '../hooks/useOrders';
import { ORDER_TYPES } from '../lib/constants';
import Header from '../components/Header';
import DashboardSummary from '../components/DashboardSummary';
import OrderTable from '../components/OrderTable';
import OrderForm from '../components/OrderForm';
import ActivityLog from '../components/ActivityLog';
import ArchivedOrders from '../components/ArchivedOrders';
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
    formatDate(o.start_date),
    formatDate(o.due_date),
    o.customer,
    o.po_number || '',
    o.quantity ?? '',
    o.pvg || '',
    o.dowel_size || '',
    o.oc || '',
    o.coating === 'Other' ? `Other: ${o.coating_other || ''}` : (o.coating || ''),
    o.num_dowels ?? '',
    o.total_lf ?? '',
    o.status,
    o.cpu_asap ? 'Yes' : 'No',
    o.order_type,
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
  const {
    orders,
    loading,
    flashedId,
    createOrder,
    updateOrder,
    archiveOrder,
    unarchiveOrder,
    fetchAllOrders,
  } = useOrders();

  const [activeTab, setActiveTab] = useState('Baskets');
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Tab counts: active (non-cancelled, non-archived) per type
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const type of ORDER_TYPES) {
      counts[type] = orders.filter(
        o => o.order_type === type && o.status !== 'Cancelled' && !o.archived
      ).length;
    }
    return counts;
  }, [orders]);

  // Visible orders for active tab (non-archived, matching tab type)
  // CPU ASAP rows pinned to top, then sorted by due_date ascending
  const visibleOrders = useMemo(() => {
    const filtered = orders.filter(o => o.order_type === activeTab && !o.archived);
    const cpuAsap = filtered.filter(o => o.cpu_asap).sort((a, b) => a.due_date < b.due_date ? -1 : 1);
    const rest = filtered.filter(o => !o.cpu_asap).sort((a, b) => a.due_date < b.due_date ? -1 : 1);
    return [...cpuAsap, ...rest];
  }, [orders, activeTab]);

  const handleAddOrder = () => { setEditingOrder(null); setFormOpen(true); };
  const handleEdit = (order) => { setEditingOrder(order); setFormOpen(true); };
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

  const handleArchive = useCallback(async (order) => {
    await archiveOrder(order.id, order.customer);
    showToast(`Order archived`);
  }, [archiveOrder]);

  const handleUnarchive = useCallback(async (id) => {
    await unarchiveOrder(id);
    showToast('Order restored to active');
  }, [unarchiveOrder]);

  const handleExport = () => {
    exportToCSV(visibleOrders);
  };

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
          background: 'var(--accent-green)', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(74,124,63,0.4)',
        }}>
          {toast}
        </div>
      )}

      <Header
        activeTab={activeTab}
        onTabChange={(t) => { setActiveTab(t); setExpandedId(null); }}
        tabCounts={tabCounts}
        onAddOrder={handleAddOrder}
        onExport={handleExport}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(p => !p)}
      />

      <DashboardSummary orders={orders} />

      {showArchived ? (
        <ArchivedOrders
          fetchAllOrders={fetchAllOrders}
          onUnarchive={handleUnarchive}
        />
      ) : (
        <>
          {visibleOrders.length === 0 ? (
            <EmptyState tabLabel={activeTab} onAdd={handleAddOrder} />
          ) : (
            <OrderTable
              orders={visibleOrders}
              flashedId={flashedId}
              onEdit={handleEdit}
              onArchive={handleArchive}
              expandedId={expandedId}
              onToggleExpand={handleToggleExpand}
              renderActivityLog={renderActivityLog}
            />
          )}
        </>
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
