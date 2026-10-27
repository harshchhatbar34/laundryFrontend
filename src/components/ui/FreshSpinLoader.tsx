// FreshWash / LaundroFlow — Senior UI Animated Loader: Warm Aqua Aura
// Designed with layered organic physics: liquid squash & stretch droplet,
// warm ambient sunlit aura, concentric expanding ripples, counter-spinning kinetic arcs,
// and floating aquatic micro-bubbles. 100% Native Driver 60 FPS.

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface FreshSpinLoaderProps {
  /** Size preset: small (40px), medium (76px), large (104px) */
  size?: 'small' | 'medium' | 'large';
  /** Primary caption text */
  message?: string;
  /** Secondary subtitle text */
  subtitle?: string;
  /** Primary color override */
  color?: string;
  /** Whether to show the bouncing wave dots */
  showDots?: boolean;
}

const SIZES = {
  small: {
    podSize: 34,
    iconSize: 18,
    rippleSize: 42,
    ringSize: 52,
    borderWidth: 2,
    particleDistance: 12,
    titleSize: 12,
    subtitleSize: 10,
    gap: 8,
  },
  medium: {
    podSize: 56,
    iconSize: 30,
    rippleSize: 76,
    ringSize: 94,
    borderWidth: 2.5,
    particleDistance: 20,
    titleSize: 14,
    subtitleSize: 11,
    gap: 12,
  },
  large: {
    podSize: 72,
    iconSize: 40,
    rippleSize: 104,
    ringSize: 130,
    borderWidth: 3,
    particleDistance: 28,
    titleSize: 16,
    subtitleSize: 12,
    gap: 16,
  },
};

const FreshSpinLoader: React.FC<FreshSpinLoaderProps> = ({
  size = 'medium',
  message = 'Freshening Up',
  subtitle,
  color,
  showDots = true,
}) => {
  const { theme, isDark } = useTheme();
  const cfg = SIZES[size] || SIZES.medium;

  const primaryColor = color || theme.colors.primary; // Ocean Blue (#0284C7)
  const skyColor = '#38BDF8';
  const cyanColor = '#06B6D4';
  const warmAmber = '#F59E0B'; // Soft warm sunlit amber touch

  // 1. Droplet organic squash & stretch animation
  const dropletAnim = useRef(new Animated.Value(0)).current;

  // 2. Concentric liquid ripples
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  // 3. Dual orbital kinetic rings
  const spinClockwise = useRef(new Animated.Value(0)).current;
  const spinCounter = useRef(new Animated.Value(0)).current;

  // 4. Warm ambient halo breathing
  const auraPulse = useRef(new Animated.Value(0)).current;

  // 5. Rising micro-particles
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;

  // 6. Dot bounces
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Organic Droplet bounce with squash & stretch (2.4s loop)
    const dropLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dropletAnim, {
          toValue: 1, // peak height (elongate)
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dropletAnim, {
          toValue: 2, // landing impact (squash)
          duration: 550,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dropletAnim, {
          toValue: 3, // secondary micro bounce
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dropletAnim, {
          toValue: 0, // settle back to rest
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(350),
      ])
    );

    // 2. Continuous liquid ripples
    const startRipple = (val: Animated.Value, delay: number) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return anim;
    };

    const r1 = startRipple(ripple1, 0);
    const r2 = startRipple(ripple2, 1200);

    // 3. Kinetic rings
    const clockwiseLoop = Animated.loop(
      Animated.timing(spinClockwise, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const counterLoop = Animated.loop(
      Animated.timing(spinCounter, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 4. Warm ambient aura breathing
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(auraPulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Rising micro-bubbles
    const startParticle = (val: Animated.Value, delay: number, duration: number) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return anim;
    };

    const p1 = startParticle(particle1, 0, 2200);
    const p2 = startParticle(particle2, 800, 2600);

    // 6. Dot wave
    const makeDot = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -5,
            duration: 320,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 480 - delay)),
        ])
      );

    const d1 = makeDot(dot1, 0);
    const d2 = makeDot(dot2, 140);
    const d3 = makeDot(dot3, 280);

    dropLoop.start();
    clockwiseLoop.start();
    counterLoop.start();
    auraLoop.start();
    d1.start();
    d2.start();
    d3.start();

    return () => {
      dropLoop.stop();
      r1.stop();
      r2.stop();
      clockwiseLoop.stop();
      counterLoop.stop();
      auraLoop.stop();
      p1.stop();
      p2.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [
    dropletAnim,
    ripple1,
    ripple2,
    spinClockwise,
    spinCounter,
    auraPulse,
    particle1,
    particle2,
    dot1,
    dot2,
    dot3,
  ]);

  // Interpolations
  const dropTranslateY = dropletAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -10, 2, -3],
  });

  const dropScaleX = dropletAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 0.92, 1.1, 0.97],
  });

  const dropScaleY = dropletAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1.12, 0.9, 1.03],
  });

  // Concentric ripples
  const ripScale1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.85] });
  const ripOpacity1 = ripple1.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 0.25, 0] });

  const ripScale2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.85] });
  const ripOpacity2 = ripple2.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 0.25, 0] });

  // Rotations
  const spinClockDeg = spinClockwise.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinCountDeg = spinCounter.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Aura warmth
  const auraScale = auraPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] });
  const auraOpacity = auraPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  // Particles
  const p1Y = particle1.interpolate({ inputRange: [0, 1], outputRange: [cfg.particleDistance, -cfg.particleDistance - 6] });
  const p1Op = particle1.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0, 0.9, 0.7, 0] });

  const p2Y = particle2.interpolate({ inputRange: [0, 1], outputRange: [cfg.particleDistance, -cfg.particleDistance - 8] });
  const p2Op = particle2.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0, 0.8, 0.6, 0] });

  return (
    <View style={styles.container}>
      {/* Visual Animation Stage */}
      <View
        style={[
          styles.stage,
          {
            width: cfg.ringSize + 16,
            height: cfg.ringSize + 16,
          },
        ]}
      >
        {/* Layer 1: Warm Sunlit Amber/Aqua Ambient Glow */}
        <Animated.View
          style={[
            styles.auraGlow,
            {
              width: cfg.rippleSize * 1.25,
              height: cfg.rippleSize * 1.25,
              borderRadius: (cfg.rippleSize * 1.25) / 2,
              backgroundColor: isDark ? cyanColor + '20' : warmAmber + '18',
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />

        {/* Layer 2: Expanding Concentric Fluid Ripples */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              width: cfg.rippleSize,
              height: cfg.rippleSize,
              borderRadius: cfg.rippleSize / 2,
              borderColor: skyColor + '50',
              opacity: ripOpacity1,
              transform: [{ scale: ripScale1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              width: cfg.rippleSize,
              height: cfg.rippleSize,
              borderRadius: cfg.rippleSize / 2,
              borderColor: cyanColor + '40',
              opacity: ripOpacity2,
              transform: [{ scale: ripScale2 }],
            },
          ]}
        />

        {/* Layer 3: Dual Harmonic Kinetic Rings */}
        {/* Outer Ring — Clockwise with Sky & Ocean Gradient Arc */}
        <Animated.View
          style={[
            styles.kineticRing,
            {
              width: cfg.ringSize,
              height: cfg.ringSize,
              borderRadius: cfg.ringSize / 2,
              borderWidth: cfg.borderWidth,
              borderTopColor: primaryColor,
              borderRightColor: skyColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: [{ rotate: spinClockDeg }],
            },
          ]}
        />

        {/* Inner Ring — Counter-Clockwise with Warm Sunlit & Cyan Arc */}
        <Animated.View
          style={[
            styles.kineticRing,
            {
              width: cfg.rippleSize + 6,
              height: cfg.rippleSize + 6,
              borderRadius: (cfg.rippleSize + 6) / 2,
              borderWidth: cfg.borderWidth - 0.5,
              borderBottomColor: warmAmber,
              borderLeftColor: cyanColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{ rotate: spinCountDeg }],
            },
          ]}
        />

        {/* Layer 4: Floating Aquatic Micro-Bubbles */}
        <Animated.View
          style={[
            styles.floatingParticle,
            {
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: cyanColor,
              left: (cfg.ringSize - cfg.podSize) / 2 - 6,
              opacity: p1Op,
              transform: [{ translateY: p1Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingParticle,
            {
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: warmAmber,
              right: (cfg.ringSize - cfg.podSize) / 2 - 8,
              opacity: p2Op,
              transform: [{ translateY: p2Y }],
            },
          ]}
        />

        {/* Layer 5: Glassmorphic Pod with Hero Droplet & Squash/Stretch */}
        <Animated.View
          style={[
            styles.dropletPod,
            {
              width: cfg.podSize,
              height: cfg.podSize,
              borderRadius: cfg.podSize * 0.38,
              backgroundColor: isDark ? theme.colors.surface : '#FFFFFF',
              borderColor: primaryColor + '25',
              shadowColor: primaryColor,
              transform: [
                { translateY: dropTranslateY },
                { scaleX: dropScaleX },
                { scaleY: dropScaleY },
              ],
            },
          ]}
        >
          {/* Hero Water Droplet Icon */}
          <Ionicons name="water" size={cfg.iconSize} color={primaryColor} />

          {/* Tiny Warm Sunlit Highlight Glint on top corner */}
          <View
            style={[
              styles.sparkleGlint,
              {
                backgroundColor: warmAmber,
                width: cfg.iconSize * 0.22,
                height: cfg.iconSize * 0.22,
                borderRadius: (cfg.iconSize * 0.22) / 2,
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Layer 6: Polished Status Text & Bouncing Wave Dots */}
      {(message || showDots) && (
        <View style={[styles.textBlock, { marginTop: cfg.gap }]}>
          <View style={styles.titleRow}>
            {message ? (
              <Text
                style={[
                  styles.titleText,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: cfg.titleSize,
                  },
                ]}
              >
                {message}
              </Text>
            ) : null}

            {showDots && (
              <View style={styles.dotsRow}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: primaryColor,
                      transform: [{ translateY: dot1 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: skyColor,
                      transform: [{ translateY: dot2 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: warmAmber,
                      transform: [{ translateY: dot3 }],
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {subtitle ? (
            <Text
              style={[
                styles.subtitleText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: cfg.subtitleSize,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auraGlow: {
    position: 'absolute',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  rippleCircle: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  kineticRing: {
    position: 'absolute',
  },
  floatingParticle: {
    position: 'absolute',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  dropletPod: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  sparkleGlint: {
    position: 'absolute',
    top: 5,
    right: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  textBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  titleText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 14,
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  subtitleText: {
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.1,
  },
});

export default memo(FreshSpinLoader);
