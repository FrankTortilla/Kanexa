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
  'In Production': { bg: '#38BDF8', text: '#0a0a0a' },
  'Ready to Ship': { bg: '#00E676', text: '#0a0a0a' },
  'Delayed':       { bg: '#FF8C00', text: '#0a0a0a' },
  'On Hold':       { bg: '#FFD700', text: '#0a0a0a' },
  'Cancelled':     { bg: '#FF1744', text: '#ffffff' },
};

export const CPU_ASAP_COLOR = '#FF8C00'; // amber highlight for pinned rows
