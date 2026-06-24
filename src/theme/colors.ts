// FreshWash Design System — Color Tokens

export const palette = {
  // Brand Core
  ocean: '#1E3A5F',
  oceanLight: '#2A4F7A',
  oceanDark: '#142842',
  azure: '#3B82F6',
  azureLight: '#60A5FA',
  azureDark: '#2563EB',
  mint: '#10B981',
  mintLight: '#34D399',
  mintDark: '#059669',
  coral: '#FF6B6B',
  coralLight: '#FF8A8A',
  coralDark: '#E84545',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',

  // Semantic
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  indigo: '#6366F1',
} as const;

export const lightColors = {
  // Backgrounds
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // Primary actions
  primary: palette.azure,
  primaryLight: palette.azureLight,
  primaryDark: palette.azureDark,
  primaryBg: '#EFF6FF',

  // Secondary
  secondary: palette.ocean,
  secondaryLight: palette.oceanLight,

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Input
  inputBg: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputFocus: palette.azure,
  placeholder: '#94A3B8',

  // Status Colors
  success: palette.mint,
  successBg: '#D1FAE5',        // green-100 — rich, clearly green
  error: palette.coral,
  errorBg: '#FFE4E6',          // rose-100 — clearly pink
  warning: palette.amber,
  warningBg: '#FEF3C7',        // amber-100
  info: palette.azure,
  infoBg: '#DBEAFE',           // blue-100

  // Order Status
  statusPending: palette.amber,
  statusAccepted: palette.azure,
  statusPickedUp: palette.indigo,
  statusProcessing: palette.purple,
  statusReady: palette.purpleLight,
  statusOutForDelivery: palette.azureLight,
  statusDelivered: palette.mint,
  statusCompleted: palette.mintDark,
  statusCancelled: palette.coral,
  statusFailed: palette.coralDark,

  // Navigation
  tabBar: '#FFFFFF',
  tabBarActive: palette.azure,
  tabBarInactive: '#94A3B8',
  headerBg: palette.ocean,
  headerText: '#FFFFFF',

  // Card
  card: '#FFFFFF',
  cardShadow: 'rgba(30, 58, 95, 0.08)',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  shimmer: ['#F1F5F9', '#E2E8F0', '#F1F5F9'] as string[],
};

export type Colors = {
  [K in keyof typeof lightColors]: (typeof lightColors)[K] extends string ? string : (typeof lightColors)[K];
};

export const darkColors: Colors = {
  // Backgrounds
  background: '#0B1426',
  surface: '#162032',
  surfaceElevated: '#1E2D42',
  surfaceVariant: '#1A2636',

  // Primary actions
  primary: palette.azureLight,
  primaryLight: palette.azure,
  primaryDark: palette.azureDark,
  primaryBg: 'rgba(59, 130, 246, 0.15)',

  // Secondary
  secondary: palette.azureLight,
  secondaryLight: palette.azure,

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Borders & Dividers
  border: '#1E3A5F',
  borderLight: '#1A2636',
  divider: '#1A2636',

  // Input
  inputBg: '#1A2636',
  inputBorder: '#1E3A5F',
  inputFocus: palette.azureLight,
  placeholder: '#64748B',

  // Status Colors
  success: palette.mintLight,
  successBg: '#064E3B',        // green-900 — rich dark green
  error: palette.coralLight,
  errorBg: '#4C0519',          // rose-950
  warning: palette.amberLight,
  warningBg: '#451A03',        // amber-950
  info: palette.azureLight,
  infoBg: '#1E3A5F',           // ocean blue

  // Order Status
  statusPending: palette.amberLight,
  statusAccepted: palette.azureLight,
  statusPickedUp: palette.indigo,
  statusProcessing: palette.purpleLight,
  statusReady: palette.purpleLight,
  statusOutForDelivery: palette.azureLight,
  statusDelivered: palette.mintLight,
  statusCompleted: palette.mint,
  statusCancelled: palette.coralLight,
  statusFailed: palette.coral,

  // Navigation
  tabBar: '#162032',
  tabBarActive: palette.azureLight,
  tabBarInactive: '#64748B',
  headerBg: '#162032',
  headerText: '#F1F5F9',

  // Card
  card: '#162032',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: ['#1A2636', '#1E2D42', '#1A2636'] as string[],
};


export const gradients = {
  primary: [palette.azure, palette.azureDark] as string[],
  primaryLight: [palette.azureLight, palette.azure] as string[],
  ocean: [palette.ocean, palette.oceanDark] as string[],
  mint: [palette.mint, palette.mintDark] as string[],
  coral: [palette.coral, palette.coralDark] as string[],
  amber: [palette.amber, '#D97706'] as string[],
  purple: [palette.purple, '#7C3AED'] as string[],
  surface: {
    light: ['#FFFFFF', '#F8FAFC'] as string[],
    dark: ['#162032', '#0B1426'] as string[],
  },
} as const;

export type Gradients = typeof gradients;
