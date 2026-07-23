import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface AnimatedIconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
  badge?: boolean | number;
  disabled?: boolean;
}

export const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  name,
  size = 22,
  color,
  backgroundColor,
  onPress,
  style,
  badge,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const iconColor = color || theme.colors.textPrimary;
  const bg = backgroundColor || 'transparent';

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.hitTarget, style]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: bg,
            opacity: disabled ? 0.4 : 1,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name={name} size={size} color={iconColor} />
        {badge !== undefined && (typeof badge === 'number' ? badge > 0 : badge) && (
          <Animated.View style={[styles.dotBadge, { backgroundColor: theme.colors.primary }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hitTarget: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
  },
  dotBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
