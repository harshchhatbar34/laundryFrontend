import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * ThemedCard — container with shadow, border radius, and themed bg
 * Props: children, style, title, subtitle, variant ('default'|'glass'|'outline'), shadowSize ('sm'|'md'|'lg')
 */
const ThemedCard = ({ children, style, title, subtitle, variant = 'default', shadowSize = 'sm' }) => {
  const { theme } = useTheme();
  const { colors, radius, spacing, typography, shadow } = theme;

  const getVariantStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: colors.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
          backdropFilter: 'blur(10px)', // Only works on Web/iOS with specific setup, but color provides fallback
          borderColor: 'rgba(255,255,255,0.3)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        {
          borderRadius: radius.lg,
          padding: spacing.md,
          ...shadow[shadowSize],
        },
        style,
      ]}
    >
      {title && (
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default ThemedCard;
