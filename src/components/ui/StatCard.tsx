// FreshWash — Premium StatCard / KPI Component
// Modern floating KPI card with trend indicators and gold/navy accent options

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  onPress?: () => void;
  variant?: 'default' | 'gold';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  trend,
  trendUp = true,
  onPress,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const accentColor = color || (variant === 'gold' ? theme.colors.accent : theme.colors.primary);

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: variant === 'gold' ? theme.colors.borderGold : theme.colors.borderLight,
          borderRadius: theme.radius.xl, // 20px radius
        },
        variant === 'gold' ? theme.shadows.gold : theme.shadows.md,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: accentColor + '16' }]}>
          <Ionicons name={icon} size={22} color={accentColor} />
        </View>

        {trend ? (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trendUp ? theme.colors.successBg : theme.colors.errorBg,
              },
            ]}
          >
            <Ionicons
              name={trendUp ? 'trending-up-outline' : 'trending-down-outline'}
              size={12}
              color={trendUp ? theme.colors.success : theme.colors.error}
            />
            <Text
              style={[
                theme.typography.caption,
                {
                  color: trendUp ? theme.colors.success : theme.colors.error,
                  fontWeight: '700',
                  marginLeft: 3,
                },
              ]}
            >
              {trend}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[theme.typography.displayMedium, styles.valueText, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    padding: 16,
    minWidth: 135,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.5,
  },
});

export default React.memo(StatCard);
