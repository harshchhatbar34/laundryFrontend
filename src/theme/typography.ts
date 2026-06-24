// FreshWash Design System — Typography
// Display: Outfit (bold, geometric) | Body: Inter (clean, readable)

import { TextStyle } from 'react-native';

export const fonts = {
  display: 'Outfit_700Bold',
  displayMedium: 'Outfit_600SemiBold',
  heading: 'Outfit_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export type Fonts = typeof fonts;

export const typography: Record<string, TextStyle> = {
  // Display — for splash, hero, big numbers
  displayLarge: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  displayMedium: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 36,
  },

  // Headings — for screen titles, section headers
  h1: {
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  h4: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 22,
  },

  // Body
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },

  // Labels & Buttons
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  labelSmall: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  buttonSmall: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 20,
  },

  // Captions & Utility
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    lineHeight: 16,
  },

  // Data — for prices, order numbers
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  priceSmall: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  badge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
};

export type Typography = typeof typography;
