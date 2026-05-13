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
  'In Production': { bg: '#2563eb', text: '#ffffff' },
  'Ready to Ship': { bg: '#16a34a', text: '#ffffff' },
  'Delayed':       { bg: '#FF8C00', text: '#ffffff' },
  'On Hold':       { bg: '#ca8a04', text: '#ffffff' },
  'Cancelled':     { bg: '#FF1744', text: '#ffffff' },
};

export const CPU_ASAP_COLOR = '#FF8C00'; // amber highlight for pinned rows
