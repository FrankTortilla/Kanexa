'use client';
import { formatDate } from '../utils/formatters';

export default function PrintView({ shipments, statusFilter, searchQuery, totalCount }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="print-only" style={{ display: 'none' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 4px' }}>Green Steel Shipment Tracker</h1>
        <p style={{ fontSize: '12px', margin: '0 0 2px', color: '#555' }}>
          Printed: {dateStr} at {timeStr}
        </p>
        <p style={{ fontSize: '12px', margin: '0 0 12px', color: '#555' }}>
          {statusFilter !== 'All' && `Filter: ${statusFilter} | `}
          {searchQuery && `Search: "${searchQuery}" | `}
          Showing {shipments.length} of {totalCount} shipments
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr>
              {['Ship Date', 'Del. Date', 'Customer', 'City/State', 'Materials', 'PO#', 'Carrier', 'Tracking#', 'Trailer Type', 'Weight', 'Miles', 'Instructions', 'Status'].map(h => (
                <th key={h} style={{ border: '1px solid #333', padding: '4px 6px', background: '#eee', fontWeight: 'bold', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => {
              const matItems = s.shipment_materials && s.shipment_materials.length > 0
                ? s.shipment_materials
                : s.material ? [{ quantity: s.quantity != null ? String(s.quantity) : '', material_name: s.material }] : [];
              const materialsStr = matItems.map(m => `${m.quantity ? m.quantity + ' ' : ''}${m.material_name}`).join(' / ');
              return (
                <tr key={s.id}>
                  <td style={printTd}>{formatDate(s.ship_date)}</td>
                  <td style={printTd}>{formatDate(s.delivery_date)}</td>
                  <td style={printTd}>{s.customer_name}</td>
                  <td style={printTd}>{s.city}{s.state ? `, ${s.state}` : ''}</td>
                  <td style={printTd}>{materialsStr}</td>
                  <td style={printTd}>{s.po_number}</td>
                  <td style={printTd}>{s.carrier_name}</td>
                  <td style={printTd}>{s.tracking_number}</td>
                  <td style={printTd}>{s.trailer_type}</td>
                  <td style={printTd}>{s.weight}</td>
                  <td style={printTd}>{s.total_mileage}</td>
                  <td style={printTd}>{s.special_instructions}</td>
                  <td style={printTd}>{s.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const printTd = { border: '1px solid #333', padding: '3px 6px' };
