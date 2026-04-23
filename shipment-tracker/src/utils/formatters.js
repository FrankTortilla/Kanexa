/**
 * Format a date string or Date object to MM/DD/YYYY (US standard).
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date + (typeof date === 'string' && !date.includes('T') ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Format a timestamp to a readable date+time string.
 * e.g., "Apr 8, 2026 2:15 PM"
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Truncate text to a max length, appending ellipsis if truncated.
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Get today's date as YYYY-MM-DD string (for input[type="date"] default values).
 */
export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
