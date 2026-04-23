'use client';
import { ROWS_PER_PAGE_OPTIONS } from '../lib/constants';

export default function Pagination({ currentPage, totalItems, rowsPerPage, onPageChange, onRowsPerPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  if (totalItems <= 25) return null;

  return (
    <div className="no-print" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '16px 24px',
      borderTop: '1px solid var(--border)',
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={navBtnStyle(currentPage <= 1)}
      >
        ← Previous
      </button>

      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={navBtnStyle(currentPage >= totalPages)}
      >
        Next →
      </button>

      <select
        value={rowsPerPage}
        onChange={e => onRowsPerPageChange(Number(e.target.value))}
        style={{
          padding: '6px 10px',
          fontSize: '13px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        {ROWS_PER_PAGE_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt} per page</option>
        ))}
      </select>
    </div>
  );
}

function navBtnStyle(disabled) {
  return {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: disabled ? 'transparent' : 'var(--bg-hover)',
    color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
