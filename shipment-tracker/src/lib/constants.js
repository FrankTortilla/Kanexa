export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
];

export const STATUS = {
  PENDING:    'Pending',
  BOOKED:     'Booked',
  IN_TRANSIT: 'In Transit',
  DELIVERED:  'Delivered',
};

export const STATUSES    = ['Pending', 'Booked', 'In Transit', 'Delivered'];
export const STATUS_LIST = STATUSES;

// Warehouse badge colors — dark/colored bg, white text, glow effect
export const STATUS_COLORS = {
  Pending:      { bg: 'var(--accent-pending)',    text: '#FFFFFF', glow: 'var(--accent-pending-glow)'    },
  Booked:       { bg: 'var(--accent-booked)',     text: '#FFFFFF', glow: 'var(--accent-booked-glow)'     },
  'In Transit': { bg: 'var(--accent-in-transit)', text: '#FFFFFF', glow: 'var(--accent-in-transit-glow)' },
  Delivered:    { bg: 'var(--accent-delivered)',  text: '#ffffff', glow: 'var(--accent-delivered-glow)'  },
};

// Office badge colors — solid bg, white text (pill style)
export const BADGE_COLORS = {
  Pending:      { bg: '#f59e0b', text: '#ffffff' },
  Booked:       { bg: '#3b82f6', text: '#ffffff' },
  'In Transit': { bg: '#f97316', text: '#ffffff' },
  Delivered:    { bg: '#22c55e', text: '#ffffff' },
};

export const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];
export const DEFAULT_ROWS_PER_PAGE = 25;
