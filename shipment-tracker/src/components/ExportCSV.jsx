'use client';
import { formatDate } from '../utils/formatters';

const CSV_COLUMNS = [
  { key: 'ship_date', label: 'Ship Date', format: (v) => formatDate(v) },
  { key: 'delivery_date', label: 'Delivery Date', format: (v) => v ? formatDate(v) : 'TBD' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'loading_building', label: 'Building' },
  { key: 'materials', label: 'Materials', format: (_, s) => {
    const items = s.shipment_materials && s.shipment_materials.length > 0
      ? s.shipment_materials
      : s.material ? [{ quantity: s.quantity != null ? String(s.quantity) : '', material_name: s.material }] : [];
    return items.map(m => `${m.quantity ? m.quantity + ' ' : ''}${m.material_name}`).join(' / ');
  }},
  { key: 'po_number', label: 'PO#' },
  { key: 'carrier_name', label: 'Carrier Name' },
  { key: 'tracking_number', label: 'Tracking#' },
  { key: 'trailer_type', label: 'Trailer Type' },
  { key: 'weight', label: 'Weight' },
  { key: 'total_mileage', label: 'Total Mileage' },
  { key: 'special_instructions', label: 'Special Instructions' },
  { key: 'status', label: 'Status' },
];

function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function exportToCSV(shipments) {
  const header = CSV_COLUMNS.map(c => c.label).join(',');
  const rows = shipments.map(s =>
    CSV_COLUMNS.map(c => {
      const val = c.format ? c.format(s[c.key], s) : s[c.key];
      return escapeCSV(val);
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shipments-export-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
