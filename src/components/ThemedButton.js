import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

/**
 * ThemedButton
 * Props: onPress, label, variant ('primary'|'outline'|'ghost'|'danger'|'accent'), loading, disabled, style, textStyle, icon
 */
const ThemedButton = ({
  onPress,
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = true,
}) => {
  const { theme } = useTheme();
  const { colors, radius, typography, spacing, gradients, shadow } = theme;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const variantStyles = {
    primary: {
      bg: colors.primary,
      gradient: gradients.primary,
      text: '#FFFFFF',
      border: 'transparent',
    },
    accent: {
      bg: colors.accent,
      gradient: gradients.accent,
      text: '#FFFFFF',
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: colors.primary,
      border: colors.primary,
    },
    ghost: {
      bg: colors.surfaceVariant,
      text: colors.text,
      border: 'transparent',
    },
    danger: {
      bg: colors.error,
      text: '#FFFFFF',
      border: 'transparent',
    },
  };

  const v = variantStyles[variant] || variantStyles.primary;

  const ButtonContent = () => (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
          <Text style={[typography.button, { color: v.text }, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: fullWidth ? '100%' : undefined }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.base,
          {
            backgroundColor: v.gradient ? 'transparent' : v.bg,
            borderColor: v.border,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderRadius: radius.md,
            height: 54,
            opacity: disabled ? 0.6 : 1,
            ...(variant === 'primary' || variant === 'accent' ? shadow.md : {}),
          },
        ]}
      >
        {v.gradient ? (
          <LinearGradient
            colors={v.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius: radius.md }]}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <ButtonContent />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

export default ThemedButton;
