import React, { createContext, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setSystemTheme } from '../store/themeSlice';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(setSystemTheme(colorScheme || 'light'));
    });
    return () => subscription.remove();
  }, [dispatch]);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook — use in every screen/component
 * const { theme } = useTheme();
 */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
