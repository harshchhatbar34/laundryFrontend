/**
 * AnimatedTabBarItem — Premium, modern bottom tab icon + label.
 *
 * Design goals (Instagram / WhatsApp style):
 *  • No giant pill background — instead a thin coloured dot/line indicator
 *  • Icon springs up slightly when active
 *  • Label is always visible, never truncated (short labels only)
 *  • Subtle press-down scale for tactile feel
 *  • 100% GPU-driven via useNativeDriver
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface AnimatedTabBarItemProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconFilledName?: keyof typeof Ionicons.glyphMap;
  /** Directly from React Navigation tabBarIcon({ focused }) — always reliable */
  focused: boolean;
  activeColor?: string;
  inactiveColor?: string;
  badgeCount?: number;
  /** Unused when rendered inside tabBarIcon — kept for API compatibility */
  onPress?: () => void;
}

export const AnimatedTabBarItem: React.FC<AnimatedTabBarItemProps> = ({
  label,
  iconName,
  iconFilledName,
  focused,
  activeColor,
  inactiveColor,
  badgeCount,
}) => {
  const { theme } = useTheme();
  const colorActive = activeColor ?? theme.colors.tabBarActive;
  const colorInactive = inactiveColor ?? theme.colors.tabBarInactive;
  const iconColor = focused ? colorActive : colorInactive;

  // Icon bounce up when focused
  const translateYAnim = useRef(new Animated.Value(0)).current;
  // Icon scale
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Dot indicator under the icon (width expands)
  const dotScaleXAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const dotOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  // Label opacity — always visible but slightly dimmed when inactive
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: focused ? -3 : 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(dotScaleXAnim, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: focused ? 1 : 0.5,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const iconToRender = focused && iconFilledName ? iconFilledName : iconName;

  return (
    <View style={styles.container}>
      {/* Icon + optional badge */}
      <Animated.View
        style={[
          styles.iconRow,
          {
            transform: [
              { translateY: translateYAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Ionicons name={iconToRender} size={23} color={iconColor} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : String(badgeCount)}</Text>
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Animated.Text
        style={[
          styles.label,
          {
            color: iconColor,
            fontWeight: focused ? '700' : '500',
            opacity: labelOpacityAnim,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>

      {/* Active dot indicator */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: colorActive,
            opacity: dotOpacityAnim,
            transform: [{ scaleX: dotScaleXAnim }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    width: 64,
  },
  iconRow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: 64,
  },
  dot: {
    marginTop: 4,
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});
