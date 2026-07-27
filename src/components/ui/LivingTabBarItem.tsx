/**
 * LivingTabBarItem — Next-Gen Living Navigation Icon System
 *
 * Clean, pill-centered active background with zero icon clipping or distortion.
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
  const pillScaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.55)).current;

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
      Animated.spring(pillScaleAnim, {
        toValue: focused ? 1 : 0,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
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
  }, [focused, pillScaleAnim, pillOpacityAnim, labelOpacityAnim]);

  const pillBg = pillColor ?? activeColor + '18'; // Soft 10% opacity pill
  const iconColor = focused ? activeColor : inactiveColor;

  const renderIcon = () => {
    switch (name) {
      case 'dashboard':
        return <DashboardLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'branches':
        return <BranchesLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'services':
        return <ServicesLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'orders':
        return <OrdersLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'cart':
        return <CartLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'reports':
        return <ReportsLivingIcon focused={focused} color={iconColor} size={24} />;
      case 'settings':
        return <SettingsLivingIcon focused={focused} color={iconColor} size={24} />;
      default:
        return <DashboardLivingIcon focused={focused} color={iconColor} size={24} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated pill background */}
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: pillBg,
              opacity: pillOpacityAnim,
              transform: [{ scale: pillScaleAnim }],
            },
          ]}
        />

        {/* Living SVG Icon */}
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
    width: 68,
    paddingTop: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 32,
  },
  pill: {
    position: 'absolute',
    width: 52,
    height: 30,
    borderRadius: 15,
  },
  label: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: 68,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
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
