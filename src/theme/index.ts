// FreshWash Design System — Theme Index
// Unifies all design tokens into light and dark theme objects

import { lightColors, darkColors, gradients, palette, Colors, Gradients } from './colors';
import { typography, fonts, Typography, Fonts } from './typography';
import { spacing, radius, iconSize, hitSlop, Spacing, Radius, IconSize, HitSlop } from './spacing';
import { shadows, Shadows } from './shadows';

export interface Theme {
  mode: 'light' | 'dark';
  colors: Colors;
  gradients: Gradients;
  palette: typeof palette;
  typography: Typography;
  fonts: Fonts;
  spacing: Spacing;
  radius: Radius;
  iconSize: IconSize;
  hitSlop: HitSlop;
  shadows: Shadows;
}

const createTheme = (mode: 'light' | 'dark', colors: Colors): Theme => ({
  mode,
  colors,
  gradients,
  palette,
  typography,
  fonts,
  spacing,
  radius,
  iconSize,
  hitSlop,
  shadows,
});

export const lightTheme = createTheme('light', lightColors);
export const darkTheme = createTheme('dark', darkColors);

export { palette, gradients, typography, fonts, spacing, radius, iconSize, hitSlop, shadows };
