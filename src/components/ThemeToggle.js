import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { persistTheme } from '../store/themeSlice';
import { useTheme } from '../theme/ThemeProvider';

/**
 * ThemeToggle — sun/moon toggle button
 * Can be used in header or profile screen
 */
const ThemeToggle = ({ style }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;

  const isDark = mode === 'dark';

  const handleToggle = () => {
    dispatch(persistTheme(isDark ? 'light' : 'dark'));
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceVariant,
          borderRadius: radius.full,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  icon: { fontSize: 18 },
});

export default ThemeToggle;
