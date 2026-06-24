// FreshWash — Card Component
// Elevated card with theme-aware shadows and subtle border

import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'elevated', // elevated, outlined, flat
  style,
  padding = 'medium', // none, small, medium, large
  disabled = false,
}) => {
  const { theme } = useTheme();

  const paddingMap = {
    none: 0,
    small: theme.spacing.sm,
    medium: theme.spacing.base,
    large: theme.spacing.xl,
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          ...theme.shadows.md,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'flat':
        return {
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const cardStyle = [
    styles.card,
    {
      borderRadius: theme.radius.lg,
      padding: paddingMap[padding],
    },
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        style={cardStyle as any}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle as any}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default React.memo(Card);
