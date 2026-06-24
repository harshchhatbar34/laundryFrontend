// FreshWash — Theme Context Provider
// System preference detection + manual toggle (Light / Dark / System)

import React, { createContext, useContext, useEffect, useMemo, ReactNode, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme, Theme } from './index';
import { loadSavedTheme } from '../store/slices/themeSlice';

export interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const themePreference = useSelector((state: any) => state.theme.preference);

  useEffect(() => {
    dispatch(loadSavedTheme() as any);
  }, [dispatch]);

  useEffect(() => {
    setSystemScheme(Appearance.getColorScheme());

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const theme = useMemo(() => {
    let mode: 'light' | 'dark';
    if (themePreference === 'system') {
      mode = systemScheme === 'dark' ? 'dark' : 'light';
    } else {
      mode = themePreference === 'dark' ? 'dark' : 'light';
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [themePreference, systemScheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme.mode === 'dark',
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
