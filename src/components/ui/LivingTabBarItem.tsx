/**
 * LivingTabBarItem — Next-Gen Living Navigation Icon System
 *
 * Wide Zomato-style active capsule pill (~90% slot width, borderRadius 22)
 * + high-contrast slate text (#334155, 11.5px, 600 weight) for unselected tabs.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  DashboardLivingIcon,
  HomeLivingIcon,
  ProfileLivingIcon,
  BranchesLivingIcon,
  ServicesLivingIcon,
  OrdersLivingIcon,
  CartLivingIcon,
  ReportsLivingIcon,
  SettingsLivingIcon,
} from './living-icons';

export type LivingIconType =
  | 'dashboard'
  | 'home'
  | 'profile'
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

  // Pill scale
  const pillScaleAnim = useRef(new Animated.Value(focused ? 1 : 0.95)).current;

  // Label opacity
  const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // iOS-only haptic feedback on tab tap
    if (focused && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Expand/collapse pill container
    Animated.parallel([
      Animated.spring(pillScaleAnim, {
        toValue: focused ? 1 : 0.95,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: focused ? 1 : 0.9,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, pillScaleAnim, labelOpacityAnim]);

  // Soft tint background when focused
  const pillBg = pillColor ?? activeColor + '18';

  const iconColor = focused ? activeColor : inactiveColor;
  const textColor = focused ? activeColor : inactiveColor;

  const renderIcon = () => {
    const iconKey = `${name}-${focused ? 'active' : 'inactive'}`;
    switch (name) {
      case 'dashboard':
        return <DashboardLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'home':
        return <HomeLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'profile':
        return <ProfileLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'branches':
        return <BranchesLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'services':
        return <ServicesLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'orders':
        return <OrdersLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'cart':
        return <CartLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'reports':
        return <ReportsLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      case 'settings':
        return <SettingsLivingIcon key={iconKey} focused={focused} color={iconColor} size={21} />;
      default:
        return <DashboardLivingIcon focused={focused} color={iconColor} size={21} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Wide Zomato-Style Animated Pill Container */}
      <Animated.View
        style={[
          styles.pillContainer,
          {
            backgroundColor: focused ? pillBg : 'transparent',
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

        {/* Clear Crisp Text Label */}
        <Animated.Text
          style={[
            styles.label,
            {
              color: textColor,
              fontWeight: focused ? '700' : '600',
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
    width: '100%',
    flex: 1,
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 22,
    width: '90%',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 21,
  },
  label: {
    fontSize: 11.5,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
    letterSpacing: 0.1,
  },
  badge: {
    position: 'absolute',
    top: -5,
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
