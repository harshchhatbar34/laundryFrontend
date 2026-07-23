/**
 * PremiumTabBarItem
 *
 * Premium bottom tab icon inspired by:
 *  - WhatsApp: animated pill/capsule behind active icon
 *  - Zerodha/Groww: brand color active + grey inactive, thick clear icons
 *  - Amazon/LinkedIn: bold filled icons (same weight active & inactive)
 *  - Zepto: colored active state with smooth transition
 *
 * Platform enhancements:
 *  - iOS: Haptic feedback (ImpactFeedbackStyle.Light) on tab focus
 *  - Android: No haptics — zero impact on Android behaviour or build
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface PremiumTabBarItemProps {
  /** Filled icon name (NO -outline suffix) */
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  /** Pill background color. Defaults to activeColor at 13% opacity */
  pillColor?: string;
  badgeCount?: number;
}

export const PremiumTabBarItem: React.FC<PremiumTabBarItemProps> = ({
  iconName,
  label,
  focused,
  activeColor,
  inactiveColor,
  pillColor,
  badgeCount,
}) => {
  const isFirstRender = useRef(true);

  // Pill expand/shrink
  const pillWidthAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Icon scale bounce
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.5)).current;

  useEffect(() => {
    // Skip haptics on first render (initial mount)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // ✅ iOS-ONLY haptic feedback — zero effect on Android build or runtime
    if (focused && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Silently ignore if haptics not available
      });
    }

    // Pill expand/collapse with spring physics
    Animated.parallel([
      Animated.spring(pillWidthAnim, {
        toValue: focused ? 1 : 0,
        friction: 7,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.timing(pillOpacityAnim, {
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

    if (focused) {
      // Spring bounce icon on focus
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.22,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const pillWidth = pillWidthAnim.interpolate({
    inputRange: [0, 1],
    // iOS: slightly larger pill breathing room
    outputRange: [36, Platform.OS === 'ios' ? 68 : 64],
  });

  const pillHeight = pillWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Platform.OS === 'ios' ? 32 : 28],
  });

  const pillBg = pillColor ?? activeColor + '22'; // 13% opacity
  const iconColor = focused ? activeColor : inactiveColor;

  return (
    <View style={styles.container}>
      {/* Animated pill background */}
      <Animated.View
        style={[
          styles.pill,
          {
            width: pillWidth,
            height: pillHeight,
            backgroundColor: pillBg,
            opacity: pillOpacityAnim,
            borderRadius: 16,
          },
        ]}
      />

      {/* Icon with spring scale bounce */}
      <Animated.View
        style={[
          styles.iconWrap,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={iconName}
          size={25}
          color={iconColor}
        />
        {/* Badge count */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    paddingTop: 6,
    paddingBottom: 2,
  },
  pill: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 28,
    marginTop: 3,
  },
  label: {
    fontSize: 10.5,
    marginTop: 3,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: 72,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});
