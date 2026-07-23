import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
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
  /** Passed directly from React Navigation's tabBarIcon({ focused }) */
  focused: boolean;
  onPress?: () => void;
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
  const colorActive = activeColor ?? theme.colors.primary;
  const colorInactive = inactiveColor ?? theme.colors.textMuted;
  const iconColor = focused ? colorActive : colorInactive;

  // Spring scale: icon bounces up when focused
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  // Pill glow behind the active icon
  const pillOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.12 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: focused ? -2 : 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  // Press-down tactile scale
  const pressScaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.spring(pressScaleAnim, { toValue: 0.88, friction: 4, tension: 200, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(pressScaleAnim, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }).start();

  const iconToRender = focused && iconFilledName ? iconFilledName : iconName;

  // When used inside tabBarIcon, onPress is not provided — navigation handles it.
  // When used standalone (e.g. tabBarButton), onPress is provided.
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
      >
        <AnimatedContent
          scaleAnim={scaleAnim}
          pressScaleAnim={pressScaleAnim}
          translateYAnim={translateYAnim}
          pillOpacityAnim={pillOpacityAnim}
          colorActive={colorActive}
          iconToRender={iconToRender}
          iconColor={iconColor}
          label={label}
          focused={focused}
          badgeCount={badgeCount}
          badgeColor={theme.colors.error}
        />
      </TouchableOpacity>
    );
  }

  // Inside tabBarIcon — no wrapping TouchableOpacity needed
  return (
    <Animated.View
      style={[
        styles.iconModeWrapper,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pressScaleAnim) },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      {/* Pill glow */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: colorActive + '20', opacity: pillOpacityAnim },
        ]}
      />
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Ionicons name={iconToRender} size={22} color={iconColor} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        )}
      </View>
      {/* Label */}
      <Text
        style={[styles.label, { color: iconColor, fontWeight: focused ? '700' : '500' }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

/** Shared animated content block used both for touchable and icon-mode */
function AnimatedContent({
  scaleAnim, pressScaleAnim, translateYAnim, pillOpacityAnim,
  colorActive, iconToRender, iconColor, label, focused, badgeCount, badgeColor,
}: any) {
  return (
    <Animated.View
      style={[
        styles.iconModeWrapper,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pressScaleAnim) },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: colorActive + '20', opacity: pillOpacityAnim },
        ]}
      />
      <View style={styles.iconWrap}>
        <Ionicons name={iconToRender} size={22} color={iconColor} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: iconColor, fontWeight: focused ? '700' : '500' }]} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  iconModeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    minWidth: 52,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    minWidth: 26,
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
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
