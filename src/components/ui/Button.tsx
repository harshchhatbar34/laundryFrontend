// FreshWash — Button Component
// Primary, secondary, outline, ghost variants with loading state

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
    large: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 },
  };

  const textSizes = {
    small: theme.typography.buttonSmall,
    medium: theme.typography.button,
    large: { ...theme.typography.button, fontSize: 18 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: true,
          gradientColors: theme.gradients.primary,
          textColor: '#FFFFFF',
          shadow: theme.shadows.primary,
          backgroundColor: undefined,
          borderWidth: undefined,
          borderColor: undefined,
        };
      case 'secondary':
        return {
          gradient: false,
          gradientColors: undefined,
          backgroundColor: theme.colors.primaryBg,
          textColor: theme.colors.primary,
          borderWidth: 0,
          borderColor: undefined,
          shadow: undefined,
        };
      case 'outline':
        return {
          gradient: false,
          gradientColors: undefined,
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          shadow: undefined,
        };
      case 'ghost':
        return {
          gradient: false,
          gradientColors: undefined,
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
          borderWidth: 0,
          borderColor: undefined,
          shadow: undefined,
        };
      case 'danger':
        return {
          gradient: true,
          gradientColors: theme.gradients.coral,
          textColor: '#FFFFFF',
          shadow: theme.shadows.error,
          backgroundColor: undefined,
          borderWidth: undefined,
          borderColor: undefined,
        };
      default:
        return {
          gradient: false,
          gradientColors: undefined,
          backgroundColor: undefined,
          textColor: '#000000',
          borderWidth: undefined,
          borderColor: undefined,
          shadow: undefined,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const buttonSize = sizeStyles[size] || sizeStyles.medium;
  const textSize = textSizes[size] || textSizes.medium;

  const iconElement = icon && !loading ? (
    <Ionicons
      name={icon}
      size={size === 'small' ? 16 : 20}
      color={variantStyle.textColor}
      style={iconPosition === 'left' ? { marginRight: 8 } : { marginLeft: 8 }}
    />
  ) : null;

  const content = (
    <View style={[styles.content, buttonSize]}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.textColor} />
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          <Text
            style={[
              textSize,
              { color: variantStyle.textColor },
              isDisabled && { opacity: 0.6 },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </View>
  );

  const containerStyle = [
    styles.container,
    { borderRadius: theme.radius.md },
    !variantStyle.gradient && { backgroundColor: variantStyle.backgroundColor },
    variantStyle.borderWidth !== undefined && {
      borderWidth: variantStyle.borderWidth,
      borderColor: variantStyle.borderColor,
    },
    variantStyle.shadow as any,
    fullWidth && { width: '100%' },
    isDisabled && { opacity: 0.5 },
    style,
  ];

  if (variantStyle.gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && { width: '100%' }, style] as any}
      >
        <LinearGradient
          colors={(isDisabled ? [theme.colors.border, theme.colors.border] : variantStyle.gradientColors) as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            { borderRadius: theme.radius.md },
            variantStyle.shadow as any,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={containerStyle as any}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(Button);
