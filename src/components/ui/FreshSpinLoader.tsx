// FreshWash / LaundroFlow — FreshSpinLoader Component
// Completely new, futuristic aquatic vortex & droplet loader with dual counter-spinning orbital rings,
// a breathing liquid core, orbiting micro-bubbles, and animated wave dots.

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface FreshSpinLoaderProps {
  /** Size preset: small (36px), medium (68px), large (96px) */
  size?: 'small' | 'medium' | 'large';
  /** Optional caption displayed beneath the loader */
  message?: string;
  /** Primary accent color override (defaults to theme.colors.primary) */
  color?: string;
  /** Whether to show the 3 animated bouncing wave dots */
  showDots?: boolean;
}

const SIZE_CONFIGS = {
  small: {
    outerSize: 42,
    innerSize: 30,
    coreSize: 22,
    iconSize: 13,
    borderWidth: 2.5,
    dotSize: 4,
    dotSpacing: 4,
    gap: 8,
    textSize: 11,
  },
  medium: {
    outerSize: 72,
    innerSize: 52,
    coreSize: 36,
    iconSize: 20,
    borderWidth: 3,
    dotSize: 6,
    dotSpacing: 6,
    gap: 12,
    textSize: 13,
  },
  large: {
    outerSize: 100,
    innerSize: 74,
    coreSize: 50,
    iconSize: 28,
    borderWidth: 3.5,
    dotSize: 7,
    dotSpacing: 7,
    gap: 16,
    textSize: 15,
  },
};

const FreshSpinLoader: React.FC<FreshSpinLoaderProps> = ({
  size = 'medium',
  message,
  color,
  showDots = true,
}) => {
  const { theme } = useTheme();
  const primaryColor = color || theme.colors.primary;
  const secondaryColor = theme.colors.secondary || '#38BDF8';
  const cyanColor = '#06B6D4';

  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.medium;

  // Animation values
  const rotateClockwise = useRef(new Animated.Value(0)).current;
  const rotateCounter = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(0)).current;
  const bubbleOrbit = useRef(new Animated.Value(0)).current;

  // Wave dots (3 dots bouncing sequentially)
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Clockwise outer ring spin
    const clockwiseAnim = Animated.loop(
      Animated.timing(rotateClockwise, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    );

    // 2. Counter-clockwise inner ring spin (harmonic speed)
    const counterAnim = Animated.loop(
      Animated.timing(rotateCounter, {
        toValue: 1,
        duration: 1900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Central droplet breathing pulse
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(corePulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Orbiting satellite bubbles
    const orbitAnim = Animated.loop(
      Animated.timing(bubbleOrbit, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 5. Bouncing dots wave
    const createDotBounce = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -6,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 500 - delay)),
        ])
      );

    const d1Anim = createDotBounce(dot1, 0);
    const d2Anim = createDotBounce(dot2, 140);
    const d3Anim = createDotBounce(dot3, 280);

    clockwiseAnim.start();
    counterAnim.start();
    pulseAnim.start();
    orbitAnim.start();
    d1Anim.start();
    d2Anim.start();
    d3Anim.start();

    return () => {
      clockwiseAnim.stop();
      counterAnim.stop();
      pulseAnim.stop();
      orbitAnim.stop();
      d1Anim.stop();
      d2Anim.stop();
      d3Anim.stop();
    };
  }, [rotateClockwise, rotateCounter, corePulse, bubbleOrbit, dot1, dot2, dot3]);

  // Rotations
  const spinClockwiseDeg = rotateClockwise.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinCounterDeg = rotateCounter.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const orbitDeg = bubbleOrbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Core pulse scale & opacity
  const coreScale = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.1],
  });

  const glowOpacity = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <View style={styles.wrapper}>
      {/* Visual Spinner Stage */}
      <View
        style={[
          styles.stage,
          {
            width: cfg.outerSize + 12,
            height: cfg.outerSize + 12,
          },
        ]}
      >
        {/* Soft Background Track */}
        <View
          style={[
            styles.trackCircle,
            {
              width: cfg.outerSize,
              height: cfg.outerSize,
              borderRadius: cfg.outerSize / 2,
              borderColor: primaryColor + '18',
              borderWidth: cfg.borderWidth,
            },
          ]}
        />

        {/* Outer Orbital Vortex Ring (Clockwise) */}
        <Animated.View
          style={[
            styles.orbitalRing,
            {
              width: cfg.outerSize,
              height: cfg.outerSize,
              borderRadius: cfg.outerSize / 2,
              borderWidth: cfg.borderWidth,
              borderTopColor: primaryColor,
              borderRightColor: secondaryColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: [{ rotate: spinClockwiseDeg }],
            },
          ]}
        />

        {/* Inner Counter-Vortex Ring (Counter-Clockwise) */}
        <Animated.View
          style={[
            styles.orbitalRing,
            {
              width: cfg.innerSize,
              height: cfg.innerSize,
              borderRadius: cfg.innerSize / 2,
              borderWidth: cfg.borderWidth - 0.5,
              borderBottomColor: cyanColor,
              borderLeftColor: secondaryColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{ rotate: spinCounterDeg }],
            },
          ]}
        />

        {/* Orbiting Micro-Bubbles Ring */}
        <Animated.View
          style={[
            styles.orbitWrapper,
            {
              width: cfg.outerSize + 10,
              height: cfg.outerSize + 10,
              transform: [{ rotate: orbitDeg }],
            },
          ]}
        >
          {/* Bubble 1 */}
          <View
            style={[
              styles.satelliteBubble,
              {
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: cyanColor,
                top: 0,
                alignSelf: 'center',
                shadowColor: cyanColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
              },
            ]}
          />
          {/* Bubble 2 */}
          <View
            style={[
              styles.satelliteBubble,
              {
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: primaryColor,
                bottom: 4,
                right: 8,
              },
            ]}
          />
        </Animated.View>

        {/* Glowing Central Liquid Core */}
        <Animated.View
          style={[
            styles.coreGlow,
            {
              width: cfg.coreSize,
              height: cfg.coreSize,
              borderRadius: cfg.coreSize / 2,
              backgroundColor: theme.colors.primaryBg,
              borderColor: primaryColor + '30',
              borderWidth: 1.5,
              opacity: glowOpacity,
              transform: [{ scale: coreScale }],
            },
          ]}
        >
          <Ionicons name="water" size={cfg.iconSize} color={primaryColor} />
        </Animated.View>
      </View>

      {/* Message and Bouncing Wave Dots */}
      {(message || showDots) && (
        <View style={[styles.labelRow, { marginTop: cfg.gap }]}>
          {message && (
            <Text
              style={[
                styles.messageText,
                {
                  color: theme.colors.textPrimary,
                  fontSize: cfg.textSize,
                },
              ]}
            >
              {message}
            </Text>
          )}

          {showDots && (
            <View style={styles.dotsContainer}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: cfg.dotSize,
                    height: cfg.dotSize,
                    borderRadius: cfg.dotSize / 2,
                    backgroundColor: primaryColor,
                    marginHorizontal: cfg.dotSpacing / 2,
                    transform: [{ translateY: dot1 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: cfg.dotSize,
                    height: cfg.dotSize,
                    borderRadius: cfg.dotSize / 2,
                    backgroundColor: secondaryColor,
                    marginHorizontal: cfg.dotSpacing / 2,
                    transform: [{ translateY: dot2 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: cfg.dotSize,
                    height: cfg.dotSize,
                    borderRadius: cfg.dotSize / 2,
                    backgroundColor: cyanColor,
                    marginHorizontal: cfg.dotSpacing / 2,
                    transform: [{ translateY: dot3 }],
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trackCircle: {
    position: 'absolute',
  },
  orbitalRing: {
    position: 'absolute',
  },
  orbitWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  satelliteBubble: {
    position: 'absolute',
  },
  coreGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  messageText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  dot: {},
});

export default memo(FreshSpinLoader);
