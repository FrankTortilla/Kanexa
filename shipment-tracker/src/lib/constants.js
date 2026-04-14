export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
];

export const STATUS = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

export const STATUS_LIST = [STATUS.PENDING, STATUS.SHIPPED, STATUS.DELIVERED];

export const STATUS_COLORS = {
  [STATUS.PENDING]: {
    bg: 'var(--accent-pending)',
    text: '#FFFFFF',
    glow: 'var(--accent-pending-glow)',
  },
  [STATUS.SHIPPED]: {
    bg: 'var(--accent-shipped)',
    text: '#FFFFFF',
    glow: 'var(--accent-shipped-glow)',
  },
  [STATUS.DELIVERED]: {
    bg: 'var(--accent-delivered)',
    text: '#ffffff',
    glow: 'var(--accent-delivered-glow)',
  },
};

export const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];
export const DEFAULT_ROWS_PER_PAGE = 25;
