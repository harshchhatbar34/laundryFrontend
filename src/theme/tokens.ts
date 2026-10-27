// FreshWash Design System — Unified Design Tokens

export const tokens = {
  colors: {
    // Primary & Core Brand (Ocean & Sky)
    deepNavy: '#0284C7',
    deepNavyLight: '#38BDF8',
    deepNavyDark: '#0369A1',

    solarGold: '#0284C7',
    solarGoldAccent: '#06B6D4',
    solarGoldLight: '#E0F2FE',
    solarGoldDark: '#0369A1',

    electricBlue: '#0284C7',
    electricBlueLight: '#38BDF8',
    electricBlueDark: '#0369A1',

    trustTeal: '#10B981',
    trustTealLight: '#34D399',
    trustTealDark: '#059669',

    // Surfaces & Canvas
    white: '#FFFFFF',
    backgroundLight: '#F8FAFC',
    backgroundDark: '#0B1426',

    // Borders & Dividers
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderGold: '#BAE6FD',
    divider: '#F1F5F9',

    // Typography Colors
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,    // Signature card radius
    xxl: 24,   // Surface dialog / sheet radius
    pill: 9999,
  },

  motion: {
    durationFast: 180,
    durationNormal: 250,
    durationSlow: 350,
    springPhysics: {
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    },
  },
} as const;

export type Tokens = typeof tokens;
