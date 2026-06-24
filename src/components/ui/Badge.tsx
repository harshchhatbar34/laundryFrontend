// FreshWash — Badge Component
// Status badges with order status colors

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getStatusColorKey, getStatusLabel } from '../../utils/helpers';

export interface BadgeProps {
  status?: string;
  label?: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium';
  style?: StyleProp<ViewStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  status, // auto-maps to color via getStatusColorKey
  label, // custom label override
  color, // custom color override
  backgroundColor, // custom bg override
  size = 'medium', // small, medium
  style,
}) => {
  const { theme } = useTheme();

  const statusColorKey = status ? getStatusColorKey(status as any) : null;
  const badgeColor = color || (statusColorKey && (theme.colors as any)[statusColorKey]) || theme.colors.primary;
  const badgeBg = backgroundColor || (badgeColor + '20'); // 20% opacity
  const badgeLabel = label || (status ? getStatusLabel(status as any) : '');

  const sizeStyles = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      textStyle: theme.typography.badge,
    },
    medium: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      textStyle: theme.typography.labelSmall,
    },
  };

  const s = sizeStyles[size] || sizeStyles.medium;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Text
        style={[
          s.textStyle,
          { color: badgeColor },
        ]}
      >
        {badgeLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});

export default React.memo(Badge);
