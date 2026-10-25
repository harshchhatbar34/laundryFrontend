// FreshWash Design System — Shadow Presets
import { Platform } from 'react-native';
import { palette } from './colors';

const createShadow = (
  color: string,
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number
): any =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    web: {
      boxShadow: `0px ${offsetY}px ${radius * 2}px rgba(${hexToRgb(color)}, ${opacity})`,
    },
  }) || {};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export const shadows = {
  none: createShadow('#000', 0, 0, 0, 0),

  // Subtle — for inputs, chips
  sm: createShadow(palette.navy, 2, 6, 0.05, 1),

  // Default — for luxury floating cards (20px radius)
  md: createShadow(palette.navy, 4, 14, 0.08, 3),

  // Prominent — for floating action buttons, modals
  lg: createShadow(palette.navy, 8, 24, 0.12, 6),

  // Heavy — for bottom sheets, overlays
  xl: createShadow(palette.navy, 12, 32, 0.16, 10),

  // Colored shadows — for Electric Blue primary buttons
  primary: createShadow(palette.electric, 4, 16, 0.28, 4),
  primaryLg: createShadow(palette.electric, 8, 24, 0.32, 8),

  // Solar Gold shadow — for gold accents & luxury highlight cards
  gold: createShadow(palette.gold, 4, 16, 0.3, 4),

  // Trust Teal shadow — for status badges
  success: createShadow(palette.teal, 4, 12, 0.22, 4),

  // Error shadow
  error: createShadow(palette.coral, 4, 12, 0.2, 4),
} as const;

export type Shadows = typeof shadows;
