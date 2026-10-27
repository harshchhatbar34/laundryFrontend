// FreshWash Design System — Color Tokens

export const palette = {
  // Brand Core - Vibrant Ocean & Sky Theme
  ocean: '#0284C7',
  oceanLight: '#38BDF8',
  oceanDark: '#0369A1',
  azure: '#0284C7',
  azureLight: '#38BDF8',
  azureDark: '#0369A1',
  cyan: '#06B6D4',
  cyanLight: '#22D3EE',
  cyanDark: '#0891B2',
  mint: '#10B981',
  mintLight: '#34D399',
  mintDark: '#059669',
  coral: '#EF4444',
  coralLight: '#F87171',
  coralDark: '#DC2626',

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

  // Compatibility aliases (mapped to brand ocean & sky, NO GOLD)
  navy: '#0369A1',
  navyLight: '#0284C7',
  navyDark: '#0c4a6e',
  electric: '#0284C7',
  electricLight: '#38BDF8',
  electricDark: '#0369A1',
  teal: '#0891B2',
  tealLight: '#22D3EE',
  tealDark: '#0e7490',
  gold: '#0284C7',
  goldLight: '#E0F2FE',
  goldAccent: '#06B6D4',
  goldDark: '#0369A1',
} as const;

export const lightColors = {
  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // Primary actions
  primary: '#0284C7',
  primaryLight: '#38BDF8',
  primaryDark: '#0369A1',
  primaryBg: '#F0F9FF',

  // Secondary
  secondary: '#0EA5E9',
  secondaryLight: '#38BDF8',
  accent: '#06B6D4',
  accentLight: '#E0F2FE',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textGold: '#0369A1',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderGold: '#BAE6FD',
  divider: '#F1F5F9',

  // Input
  inputBg: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputFocus: '#0284C7',
  placeholder: '#94A3B8',

  // Status Colors
  success: '#10B981',
  successBg: '#ECFDF5',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  info: '#0284C7',
  infoBg: '#F0F9FF',

  // Order Status
  statusPending: '#F59E0B',
  statusAccepted: '#0284C7',
  statusPickedUp: '#6366F1',
  statusProcessing: '#8B5CF6',
  statusReady: '#06D6A0',
  statusOutForDelivery: '#0284C7',
  statusDelivered: '#10B981',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',
  statusFailed: '#DC2626',

  // Navigation
  tabBar: '#FFFFFF',
  tabBarActive: '#0284C7',
  tabBarInactive: '#94A3B8',
  headerBg: '#0284C7',
  headerText: '#FFFFFF',

  // Card
  card: '#FFFFFF',
  cardShadow: 'rgba(2, 132, 199, 0.08)',
  cardShadowGold: 'rgba(2, 132, 199, 0.08)',

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
  accent: palette.cyanLight,
  accentLight: 'rgba(6, 182, 212, 0.2)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  textGold: palette.cyanLight,

  // Borders & Dividers
  border: '#1E3A5F',
  borderLight: '#1A2636',
  borderGold: '#0891B2',
  divider: '#1A2636',

  // Input
  inputBg: '#1A2636',
  inputBorder: '#1E3A5F',
  inputFocus: palette.azureLight,
  placeholder: '#64748B',

  // Status Colors
  success: palette.mintLight,
  successBg: '#064E3B',
  error: palette.coralLight,
  errorBg: '#4C0519',
  warning: palette.amberLight,
  warningBg: '#451A03',
  info: palette.azureLight,
  infoBg: '#1E3A5F',

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
  cardShadowGold: 'rgba(0, 0, 0, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: ['#1A2636', '#1E2D42', '#1A2636'] as string[],
};

export const gradients = {
  primary: ['#0284C7', '#06B6D4'] as string[],
  primaryLight: ['#38BDF8', '#0EA5E9'] as string[],
  ocean: ['#0284C7', '#0EA5E9', '#06B6D4'] as string[],
  mint: ['#10B981', '#059669'] as string[],
  coral: ['#EF4444', '#DC2626'] as string[],
  amber: ['#F59E0B', '#D97706'] as string[],
  purple: ['#8B5CF6', '#7C3AED'] as string[],
  gold: ['#0284C7', '#06B6D4'] as string[],
  teal: ['#0891B2', '#06B6D4'] as string[],
  surface: {
    light: ['#FFFFFF', '#F8FAFC'] as string[],
    dark: ['#162032', '#0B1426'] as string[],
  },
} as const;

export type Gradients = typeof gradients;
