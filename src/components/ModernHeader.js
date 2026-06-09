import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const ModernHeader = ({ user }) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: spacing.xl, paddingBottom: spacing.md }]}>
      <View style={[styles.row, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.flex}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {greeting()} 👋
          </Text>
          <Text style={[typography.h2, { color: colors.text, marginTop: 2 }]}>
            {user?.name?.split(' ')[0] || 'Guest'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
});

export default ModernHeader;
