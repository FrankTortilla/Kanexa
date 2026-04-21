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

// Office badge colors — light bg, dark text (pill style)
export const BADGE_COLORS = {
  Pending:      { bg: '#faeeda', text: '#854f0b' },
  Booked:       { bg: '#dbeafe', text: '#1e40af' },
  'In Transit': { bg: '#fff3cd', text: '#92400e' },
  Delivered:    { bg: '#dcfce7', text: '#166534' },
};

export const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];
export const DEFAULT_ROWS_PER_PAGE = 25;
