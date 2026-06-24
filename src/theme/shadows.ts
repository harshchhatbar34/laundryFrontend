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
  sm: createShadow(palette.ocean, 1, 4, 0.06, 1),

  // Default — for cards, elevated surfaces
  md: createShadow(palette.ocean, 4, 12, 0.08, 3),

  // Prominent — for floating buttons, modals
  lg: createShadow(palette.ocean, 8, 24, 0.12, 6),

  // Heavy — for bottom sheets, overlays
  xl: createShadow(palette.ocean, 12, 32, 0.16, 10),

  // Colored shadows — for primary buttons
  primary: createShadow(palette.azure, 4, 16, 0.25, 4),
  primaryLg: createShadow(palette.azure, 8, 24, 0.3, 8),

  // Success shadow — for confirmation cards
  success: createShadow(palette.mint, 4, 12, 0.2, 4),

  // Error shadow
  error: createShadow(palette.coral, 4, 12, 0.2, 4),
} as const;

export type Shadows = typeof shadows;
