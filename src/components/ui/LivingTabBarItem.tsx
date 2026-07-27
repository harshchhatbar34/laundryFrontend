/**
 * LivingTabBarItem — Next-Gen Living Navigation Icon System
 *
 * Active capsule pill encloses BOTH the living icon and the label word
 * together inside a unified rounded pill container.
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

  // Pill scale and opacity
  const pillScaleAnim = useRef(new Animated.Value(focused ? 1 : 0.95)).current;
  const pillOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.65)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // iOS-only haptic feedback on tab tap
    if (focused && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Expand/collapse pill container wrapping BOTH icon & label
    Animated.parallel([
      Animated.spring(pillScaleAnim, {
        toValue: focused ? 1 : 0.95,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: focused ? 1 : 0.65,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, pillScaleAnim, pillOpacityAnim, labelOpacityAnim]);

  const pillBg = pillColor ?? activeColor + '18'; // 10% primary tint pill
  const iconColor = focused ? activeColor : inactiveColor;

  const renderIcon = () => {
    switch (name) {
      case 'dashboard':
        return <DashboardLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'branches':
        return <BranchesLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'services':
        return <ServicesLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'orders':
        return <OrdersLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'cart':
        return <CartLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'reports':
        return <ReportsLivingIcon focused={focused} color={iconColor} size={22} />;
      case 'settings':
        return <SettingsLivingIcon focused={focused} color={iconColor} size={22} />;
      default:
        return <DashboardLivingIcon focused={focused} color={iconColor} size={22} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Pill Container wrapping BOTH Icon & Label */}
      <Animated.View
        style={[
          styles.pillContainer,
          {
            backgroundColor: focused ? pillBg : 'transparent',
            opacity: focused ? 1 : 0.85,
            transform: [{ scale: pillScaleAnim }],
          },
        ]}
      >
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

        {/* Text Label inside the capsule */}
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
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    width: 64,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 24,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: 58,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 10,
  },
});
