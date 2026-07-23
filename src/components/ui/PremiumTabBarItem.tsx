/**
 * PremiumTabBarItem
 *
 * Premium bottom tab icon inspired by:
 *  - WhatsApp: animated pill/capsule behind active icon
 *  - Zerodha/Groww: brand color active + grey inactive, thick clear icons
 *  - Amazon/LinkedIn: bold filled icons (same weight active & inactive)
 *  - Zepto: colored active state with smooth transition
 *
 * Design:
 *  - FILLED icons at 25px for BOTH states (bold, not outline)
 *  - Active: brand pill background + white icon + colored label
 *  - Inactive: grey icon at 55% opacity, no background
 *  - Spring-physics pill width animation (expand/collapse)
 *  - Icon scale bounce on tab press
 *  - Zero dependency on Lottie or external animation libs
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PremiumTabBarItemProps {
  /** Filled icon name (NO -outline suffix — we use filled for both states) */
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  /** Pill background color. Defaults to activeColor at 15% opacity */
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
  // Pill expand/shrink
  const pillWidthAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Icon scale bounce
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Icon colour interpolation (grey ↔ white)
  const iconColorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.55)).current;

  useEffect(() => {
    // Pill expand/collapse
    Animated.parallel([
      Animated.spring(pillWidthAnim, {
        toValue: focused ? 1 : 0,
        friction: 7,
        tension: 100,
        useNativeDriver: false, // width cannot use native driver
      }),
      Animated.timing(pillOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      // Icon colour
      Animated.timing(iconColorAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      // Label
      Animated.timing(labelOpacityAnim, {
        toValue: focused ? 1 : 0.5,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (focused) {
      // Bounce the icon when becoming active
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
    outputRange: [36, 64],
  });

  const pillHeight = pillWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const pillBg = pillColor ?? activeColor + '22'; // 13% opacity
  const iconColor = focused ? activeColor : inactiveColor;

  return (
    <View style={styles.container}>
      {/* Pill background */}
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

      {/* Icon on top of pill */}
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
        {/* Badge */}
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
