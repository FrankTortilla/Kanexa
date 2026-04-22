'use client';
import { useState, useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';
import { DEFAULT_ROWS_PER_PAGE } from '../lib/constants';
import { formatDate } from '../utils/formatters';

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ShipmentHistory({
  fetchAllShipments,
  unarchiveShipment,
  searchQuery,
  isWarehouse,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) {
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivePage, setArchivePage] = useState(1);
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAllShipments().then(data => {
      if (mounted) {
        setAllShipments(data.filter(s => !!s.archived_at));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [fetchAllShipments]);

  const searchFields = [
    'customer_name', 'city', 'state', 'material', 'po_number',
    'carrier_name', 'tracking_number', 'special_instructions', 'trailer_type',
  ];

  const archiveShipments = useMemo(() => {
    let result = allShipments;
    if (searchQuery && searchQuery.trim()) {
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
    return [...result].sort((a, b) => {
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

  const handleUnarchive = async (shipment) => {
    if (!unarchiveShipment) return;
    await unarchiveShipment(shipment.id);
    setAllShipments(prev =>
      prev.filter(s => s.id !== shipment.id)
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading history...
      </div>
    );
  }

  return (
    <div>
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
          {archiveShipments.length} record{archiveShipments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {archiveShipments.length === 0 ? (
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
