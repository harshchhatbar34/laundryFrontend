// FreshWash — StatCard Component
// Replaces the locally-defined StatCard memos in AdminDashboardScreen and OwnerDashboardScreen.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  /** Optional trend indicator, e.g. "+12%" */
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  trend,
  trendUp,
}) => {
  const { theme } = useTheme();
  const accentColor = color || theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderLight,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '18' }]}>
        <Ionicons name={icon} size={22} color={accentColor} />
      </View>
      <Text
        style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 10 }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
        {label}
      </Text>
      {trend ? (
        <Text
          style={[
            theme.typography.labelSmall,
            {
              color: trendUp ? theme.colors.success : theme.colors.error,
              marginTop: 4,
            },
          ]}
        >
          {trendUp ? '▲' : '▼'} {trend}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(StatCard);
