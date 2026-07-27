/**
 * LivingTabBarItem — Next-Gen Living Navigation Icon System
 *
 * Implements:
 *  - Apple craftsmanship + Zomato micro-interactions + Duolingo playful motion
 *  - Individual SVG component animations (no whole-icon scale)
 *  - WhatsApp/Zerodha active pill background expansion
 *  - iOS Haptic feedback (Light impact)
 *  - 100% Expo Go and Release build compatible
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  DashboardLivingIcon,
  BranchesLivingIcon,
  ServicesLivingIcon,
  OrdersLivingIcon,
  CartLivingIcon,
  ReportsLivingIcon,
  SettingsLivingIcon,
} from './living-icons';

export type LivingIconType =
  | 'dashboard'
  | 'branches'
  | 'services'
  | 'orders'
  | 'cart'
  | 'reports'
  | 'settings';

export interface LivingTabBarItemProps {
  name: LivingIconType;
  label: string;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  pillColor?: string;
  badgeCount?: number;
}

export const LivingTabBarItem: React.FC<LivingTabBarItemProps> = ({
  name,
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

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.5)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // iOS-only haptic feedback on tab tap
    if (focused && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Expand/collapse background active pill with spring physics
    Animated.parallel([
      Animated.spring(pillWidthAnim, {
        toValue: focused ? 1 : 0,
        friction: 7,
        tension: 110,
        useNativeDriver: false,
      }),
      Animated.timing(pillOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: focused ? 1 : 0.55,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, pillWidthAnim, pillOpacityAnim, labelOpacityAnim]);

  const pillWidth = pillWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [36, Platform.OS === 'ios' ? 68 : 64],
  });

  const pillHeight = pillWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Platform.OS === 'ios' ? 32 : 28],
  });

  const pillBg = pillColor ?? activeColor + '22';
  const iconColor = focused ? activeColor : inactiveColor;

  const renderIcon = () => {
    switch (name) {
      case 'dashboard':
        return <DashboardLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'branches':
        return <BranchesLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'services':
        return <ServicesLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'orders':
        return <OrdersLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'cart':
        return <CartLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'reports':
        return <ReportsLivingIcon focused={focused} color={iconColor} size={25} />;
      case 'settings':
        return <SettingsLivingIcon focused={focused} color={iconColor} size={25} />;
      default:
        return <DashboardLivingIcon focused={focused} color={iconColor} size={25} />;
    }
  };

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

      {/* Living SVG Icon Container */}
      <View style={styles.iconWrap}>
        {renderIcon()}

        {/* Badge count */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
          </View>
        )}
      </View>

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
