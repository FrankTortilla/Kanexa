export const ORDER_TYPES = ['Baskets', 'Loose Dowels', 'EpoxyFab'];

export const ORDER_STATUSES = [
  'In Production',
  'Ready to Ship',
  'Delayed',
  'On Hold',
  'Cancelled',
];

export const COATING_TYPES = [
  'Plain',
  'Epoxy',
  'Epoxy/Tectyl',
  'Epoxy/Patch',
  'Painted',
  'Tectyl',
  'Other',
];

// Per-order-type coating options. Baskets gets all options including Tectyl.
// Loose Dowels excludes standalone Epoxy and Tectyl.
// EpoxyFab shows only Plain and Epoxy.
export const COATING_TYPES_BY_ORDER_TYPE = {
  'Baskets':      ['Plain', 'Epoxy', 'Epoxy/Tectyl', 'Epoxy/Patch', 'Painted', 'Tectyl', 'Other'],
  'Loose Dowels': ['Plain', 'Epoxy/Tectyl', 'Epoxy/Patch', 'Painted', 'Other'],
  'EpoxyFab':     ['Plain', 'Epoxy'],
};

// Badge colors for each order status — exact values from Waypoint/shipment-tracker BADGE_COLORS.
export const STATUS_BADGE_COLORS = {
  'In Production': { bg: '#3b82f6', text: '#ffffff' }, // Waypoint Booked
  'Ready to Ship': { bg: '#22c55e', text: '#ffffff' }, // Waypoint Delivered
  'Delayed':       { bg: '#e6b800', text: '#ffffff' }, // Waypoint accent-warning
  'On Hold':       { bg: '#FF8C00', text: '#ffffff' }, // Waypoint Pending
  'Cancelled':     { bg: '#FF1744', text: '#ffffff' }, // Waypoint Cancelled
};

export const CPU_ASAP_COLOR = '#FF8C00'; // amber highlight for pinned rows
