// FreshWash Design System — Unified Design Tokens
// Inspired by Apple, Airbnb, Stripe, Dyson, and Linear

export const tokens = {
  colors: {
    // Primary & Core Brand
    deepNavy: '#0B1E3B',
    deepNavyLight: '#162E52',
    deepNavyDark: '#050E1D',

    solarGold: '#C9A227',
    solarGoldAccent: '#D4AF37',
    solarGoldLight: '#FBF3D5',
    solarGoldDark: '#A68218',

    electricBlue: '#2563EB',
    electricBlueLight: '#60A5FA',
    electricBlueDark: '#1D4ED8',

    trustTeal: '#1F8A80',
    trustTealLight: '#34D399',
    trustTealDark: '#145C55',

    // Surfaces & Canvas
    white: '#FFFFFF',
    backgroundLight: '#F7F9FC',
    backgroundDark: '#071326',

    // Borders & Dividers
    border: '#E5EAF0',
    borderLight: '#F1F5F9',
    borderGold: 'rgba(201, 162, 39, 0.35)',
    divider: '#EDF2F7',

    // Typography Colors
    textPrimary: '#0B1E3B',
    textSecondary: '#5B6472',
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
