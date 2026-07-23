import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  View,
  Text,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface AnimatedTabBarItemProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconFilledName?: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  activeColor?: string;
  inactiveColor?: string;
  badgeCount?: number;
}

export const AnimatedTabBarItem: React.FC<AnimatedTabBarItemProps> = ({
  label,
  iconName,
  iconFilledName,
  focused,
  onPress,
  activeColor,
  inactiveColor,
  badgeCount,
}) => {
  const { theme } = useTheme();
  const colorActive = activeColor || theme.colors.primary;
  const colorInactive = inactiveColor || theme.colors.textMuted;

  // Animation Refs
  const scaleAnim = useRef(new Animated.Value(focused ? 1.08 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(focused ? -2 : 0)).current;
  const pillOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillWidthAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.08 : 1,
        friction: 5,
        tension: 130,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: focused ? -2 : 0,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(pillWidthAnim, {
        toValue: focused ? 1 : 0.6,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1,
      friction: 5,
      tension: 130,
      useNativeDriver: true,
    }).start();
  };

  const iconToRender = focused && iconFilledName ? iconFilledName : iconName;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      style={styles.touchable}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        {/* Soft Glowing Animated Pill Background */}
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: colorActive + '18',
              opacity: pillOpacityAnim,
              transform: [{ scaleX: pillWidthAnim }],
            },
          ]}
        />

        {/* Vector Icon */}
        <View style={styles.iconWrap}>
          <Ionicons
            name={iconToRender}
            size={22}
            color={focused ? colorActive : colorInactive}
          />
          {badgeCount !== undefined && badgeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colorActive }]}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          )}
        </View>

        {/* Tab Title Label */}
        <Text
          style={[
            styles.label,
            {
              color: focused ? colorActive : colorInactive,
              fontWeight: focused ? '700' : '500',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    minWidth: 24,
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});
