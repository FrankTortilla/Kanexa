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
  'Other',
];

// Badge colors for each order status
export const STATUS_BADGE_COLORS = {
  'In Production': { bg: '#38BDF8', text: '#0f172a' },
  'Ready to Ship': { bg: '#22c55e', text: '#ffffff' },
  'Delayed':       { bg: '#ef4444', text: '#ffffff' },
  'On Hold':       { bg: '#FF8C00', text: '#ffffff' },
  'Cancelled':     { bg: '#FF1744', text: '#ffffff' },
};

export const CPU_ASAP_COLOR = '#FF8C00'; // amber highlight for pinned rows
