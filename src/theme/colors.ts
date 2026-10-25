// FreshWash Design System — Luxury Color Tokens (Deep Navy & Solar Gold)

export const palette = {
  // Brand Core
  navy: '#0B1E3B',
  navyLight: '#162E52',
  navyDark: '#050E1D',

  gold: '#C9A227',
  goldLight: '#FBF3D5',
  goldAccent: '#D4AF37',
  goldDark: '#A68218',

  electric: '#2563EB',
  electricLight: '#60A5FA',
  electricDark: '#1D4ED8',

  teal: '#1F8A80',
  tealLight: '#34D399',
  tealDark: '#145C55',

  coral: '#FF6B6B',
  coralLight: '#FF8A8A',
  coralDark: '#E84545',

  // Legacy compatibility keys
  ocean: '#0B1E3B',
  oceanLight: '#162E52',
  oceanDark: '#050E1D',
  azure: '#2563EB',
  azureLight: '#60A5FA',
  azureDark: '#1D4ED8',
  mint: '#1F8A80',
  mintLight: '#34D399',
  mintDark: '#145C55',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F7F9FC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0B1E3B',
  black: '#000000',

  // Semantic
  amber: '#C9A227',
  amberLight: '#FBF3D5',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  indigo: '#6366F1',
} as const;

export const lightColors = {
  // Backgrounds
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // Primary actions (Electric Blue & Solar Gold)
  primary: palette.electric,
  primaryLight: palette.electricLight,
  primaryDark: palette.electricDark,
  primaryBg: '#EFF6FF',

  // Secondary & Accents
  secondary: palette.navy,
  secondaryLight: palette.navyLight,
  accent: palette.gold,
  accentLight: palette.goldLight,

  // Text
  textPrimary: '#0B1E3B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textGold: palette.goldDark,

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderGold: 'rgba(201, 162, 39, 0.3)',
  divider: '#F1F5F9',

  // Input
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputFocus: palette.electric,
  placeholder: '#94A3B8',

  // Status Colors (Trust Teal, Solar Gold & Coral)
  success: palette.teal,
  successBg: '#E6F4F1',        // Soft Teal Tint
  error: palette.coral,
  errorBg: '#FFE4E6',
  warning: palette.gold,
  warningBg: palette.goldLight,
  info: palette.electric,
  infoBg: '#EFF6FF',

  // Order Status
  statusPending: palette.gold,
  statusAccepted: palette.electric,
  statusPickedUp: palette.indigo,
  statusProcessing: palette.purple,
  statusReady: palette.purpleLight,
  statusOutForDelivery: palette.electricLight,
  statusDelivered: palette.teal,
  statusCompleted: palette.tealDark,
  statusCancelled: palette.coral,
  statusFailed: palette.coralDark,

  // Navigation
  tabBar: '#FFFFFF',
  tabBarActive: palette.electric,
  tabBarInactive: '#94A3B8',
  headerBg: palette.navy,
  headerText: '#FFFFFF',

  // Card & Shadows
  card: '#FFFFFF',
  cardShadow: 'rgba(11, 30, 59, 0.07)',
  cardShadowGold: 'rgba(201, 162, 39, 0.15)',

  // Overlay
  overlay: 'rgba(11, 30, 59, 0.6)',
  shimmer: ['#F1F5F9', '#E2E8F0', '#F1F5F9'] as string[],
};

export type Colors = {
  [K in keyof typeof lightColors]: (typeof lightColors)[K] extends string ? string : (typeof lightColors)[K];
};

export const darkColors: Colors = {
  // Backgrounds
  background: '#071326',
  surface: '#0B1E3B',
  surfaceElevated: '#122647',
  surfaceVariant: '#10223E',

  // Primary actions
  primary: palette.electricLight,
  primaryLight: palette.electric,
  primaryDark: palette.electricDark,
  primaryBg: 'rgba(37, 99, 235, 0.18)',

  // Secondary & Accents
  secondary: palette.gold,
  secondaryLight: palette.goldAccent,
  accent: palette.goldAccent,
  accentLight: palette.goldLight,

  // Text
  textPrimary: '#F7F9FC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B1E3B',
  textGold: palette.goldAccent,

  // Borders & Dividers
  border: '#162E52',
  borderLight: '#10223E',
  borderGold: 'rgba(201, 162, 39, 0.4)',
  divider: '#10223E',

  // Input
  inputBg: '#10223E',
  inputBorder: '#162E52',
  inputFocus: palette.electricLight,
  placeholder: '#64748B',

  // Status Colors
  success: palette.tealLight,
  successBg: '#0D3834',
  error: palette.coralLight,
  errorBg: '#4C0519',
  warning: palette.goldAccent,
  warningBg: '#3A2E0A',
  info: palette.electricLight,
  infoBg: '#0B1E3B',

  // Order Status
  statusPending: palette.goldAccent,
  statusAccepted: palette.electricLight,
  statusPickedUp: palette.indigo,
  statusProcessing: palette.purpleLight,
  statusReady: palette.purpleLight,
  statusOutForDelivery: palette.electricLight,
  statusDelivered: palette.tealLight,
  statusCompleted: palette.teal,
  statusCancelled: palette.coralLight,
  statusFailed: palette.coral,

  // Navigation
  tabBar: '#0B1E3B',
  tabBarActive: palette.goldAccent,
  tabBarInactive: '#64748B',
  headerBg: '#071326',
  headerText: '#F7F9FC',

  // Card
  card: '#0B1E3B',
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  cardShadowGold: 'rgba(201, 162, 39, 0.2)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',
  shimmer: ['#10223E', '#162E52', '#10223E'] as string[],
};

export const gradients = {
  primary: ['#0B1E3B', '#1D4ED8', '#2563EB'] as string[],
  primaryLight: ['#162E52', '#2563EB', '#60A5FA'] as string[],
  ocean: ['#050E1D', '#0B1E3B', '#1D4ED8', '#2563EB'] as string[],
  gold: ['#D4AF37', '#C9A227', '#A68218'] as string[],
  teal: ['#1F8A80', '#145C55'] as string[],
  mint: ['#1F8A80', '#145C55'] as string[],
  coral: ['#FF6B6B', '#E84545'] as string[],
  amber: ['#C9A227', '#A68218'] as string[],
  purple: ['#8B5CF6', '#7C3AED'] as string[],
  surface: {
    light: ['#FFFFFF', '#F7F9FC'] as string[],
    dark: ['#0B1E3B', '#071326'] as string[],
  },
} as const;

export type Gradients = typeof gradients;

