/**
 * AnimatedLottieTabIcon
 *
 * Plays a Lottie animation when the tab becomes focused (like Zepto, Swiggy, Zomato).
 * - Focused   → plays forward from frame 0 to end
 * - Unfocused → animation is reset to frame 0 (static first frame shown)
 *
 * Uses lottie-react-native (requires native build / APK, not Expo Go).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export interface AnimatedLottieTabIconProps {
  /** Lottie JSON source — use require('../assets/lottie/home.json') */
  source: any;
  /** Whether this tab is currently focused */
  focused: boolean;
  /** Label text shown below the icon */
  label: string;
  /** Active colour (for label) */
  activeColor: string;
  /** Inactive colour (for label) */
  inactiveColor: string;
  /** Icon render size */
  size?: number;
  /** Optional badge count */
  badgeCount?: number;
  /** Error badge color */
  badgeColor?: string;
}

export const AnimatedLottieTabIcon: React.FC<AnimatedLottieTabIconProps> = ({
  source,
  focused,
  label,
  activeColor,
  inactiveColor,
  size = 44,
  badgeCount,
  badgeColor = '#EF4444',
}) => {
  const lottieRef = useRef<LottieView>(null);
  const labelColor = focused ? activeColor : inactiveColor;

  useEffect(() => {
    if (!lottieRef.current) return;
    if (focused) {
      // Play animation from beginning
      lottieRef.current.reset();
      lottieRef.current.play();
    } else {
      // Reset to first frame when leaving tab
      lottieRef.current.reset();
    }
  }, [focused]);

  return (
    <View style={styles.container}>
      {/* Lottie icon */}
      <View style={[styles.lottieWrap, { width: size, height: size }]}>
        <LottieView
          ref={lottieRef}
          source={source}
          autoPlay={false}
          loop={false}
          style={{ width: size, height: size }}
          resizeMode="contain"
          colorFilters={
            focused
              ? [] // Play in original animation colors when focused
              : [
                  // Grey-out all layers when inactive
                  { keypath: '*', color: inactiveColor },
                ]
          }
        />
        {/* Badge */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            color: labelColor,
            fontWeight: focused ? '700' : '500',
            opacity: focused ? 1 : 0.55,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Active dot indicator */}
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    width: 68,
  },
  lottieWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: 68,
  },
  activeDot: {
    marginTop: 4,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
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
