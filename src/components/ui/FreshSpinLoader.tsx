// FreshWash / LaundroFlow — Warm Water Droplet Ripple Loader
// Designed with organic liquid physics: breathing water droplet hero pod,
// warm sunlit ambient aura, triple staggered concentric ripples, floating aquatic micro-bubbles,
// and wave-bouncing status dots. 100% ZERO-SPIN, 100% Native Driver 60 FPS.

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
    podSize: 38,
    iconSize: 20,
    rippleSize: 48,
    stageSize: 76,
    borderWidth: 1.5,
    titleSize: 12,
    subtitleSize: 10,
    bubbleDistance: 16,
    gap: 8,
  },
  medium: {
    podSize: 58,
    iconSize: 30,
    rippleSize: 76,
    stageSize: 120,
    borderWidth: 2,
    titleSize: 14,
    subtitleSize: 11,
    bubbleDistance: 24,
    gap: 12,
  },
  large: {
    podSize: 74,
    iconSize: 38,
    rippleSize: 96,
    stageSize: 154,
    borderWidth: 2.5,
    titleSize: 16,
    subtitleSize: 12,
    bubbleDistance: 32,
    gap: 16,
  },
};

const FreshSpinLoader: React.FC<FreshSpinLoaderProps> = ({
  size = 'medium',
  message = '',
  subtitle,
  color,
  showDots = false,
}) => {
  const { theme, isDark } = useTheme();
  const cfg = SIZES[size] || SIZES.medium;

  const primaryColor = color || theme.colors.primary; // Ocean Blue (#0284C7)
  const skyColor = '#38BDF8';
  const cyanColor = '#06B6D4';
  const warmAmber = '#F59E0B'; // Warm sunlit amber touch

  // 1. Droplet liquid floating & breathing animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 2. Triple concentric liquid ripples
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  // 3. Warm ambient sunlit halo breathing
  const auraPulse = useRef(new Animated.Value(0)).current;

  // 4. Rising floating aquatic micro-bubbles
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  // 5. Bouncing wave dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Organic Droplet floating & breathing (smooth ease-in-out loop)
    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Continuous triple liquid ripples with staggered initial delays
    const startRipple = (val: Animated.Value, delay: number, duration: number = 2550) => {
      const anim = Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );

      const timeout = setTimeout(() => {
        val.setValue(0);
        anim.start();
      }, delay);

      return {
        stop: () => {
          clearTimeout(timeout);
          anim.stop();
        },
      };
    };

    const r1 = startRipple(ripple1, 0, 2550);
    const r2 = startRipple(ripple2, 850, 2550);
    const r3 = startRipple(ripple3, 1700, 2550);

    // 3. Warm ambient sunlit halo breathing
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

    // 4. Rising floating micro-bubbles
    const startBubble = (val: Animated.Value, delay: number, duration: number = 2700) => {
      const anim = Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      );

      const timeout = setTimeout(() => {
        val.setValue(0);
        anim.start();
      }, delay);

      return {
        stop: () => {
          clearTimeout(timeout);
          anim.stop();
        },
      };
    };

    const b1 = startBubble(bubble1, 0, 2700);
    const b2 = startBubble(bubble2, 900, 2700);
    const b3 = startBubble(bubble3, 1800, 2700);

    // 5. Bouncing wave dots
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

    breatheAnim.start();
    auraLoop.start();
    d1.start();
    d2.start();
    d3.start();

    return () => {
      breatheAnim.stop();
      r1.stop();
      r2.stop();
      r3.stop();
      auraLoop.stop();
      b1.stop();
      b2.stop();
      b3.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [
    floatAnim,
    ripple1,
    ripple2,
    ripple3,
    auraPulse,
    bubble1,
    bubble2,
    bubble3,
    dot1,
    dot2,
    dot3,
  ]);

  // Interpolations
  // Droplet floating & organic stretch
  const dropTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -6],
  });
  const dropScaleX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.02, 0.98],
  });
  const dropScaleY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.05],
  });

  // Concentric ripples
  const ripScale1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.85, 2.3] });
  const ripOpacity1 = ripple1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.65, 0.25, 0] });

  const ripScale2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.85, 2.3] });
  const ripOpacity2 = ripple2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.22, 0] });

  const ripScale3 = ripple3.interpolate({ inputRange: [0, 1], outputRange: [0.85, 2.3] });
  const ripOpacity3 = ripple3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 0.2, 0] });

  // Warm ambient aura backlight
  const auraScale = auraPulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.3] });
  const auraOpacity = auraPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  // Rising bubbles
  const b1Y = bubble1.interpolate({ inputRange: [0, 1], outputRange: [cfg.bubbleDistance * 0.6, -cfg.bubbleDistance - 8] });
  const b1Op = bubble1.interpolate({ inputRange: [0, 0.25, 0.8, 1], outputRange: [0, 0.9, 0.7, 0] });

  const b2Y = bubble2.interpolate({ inputRange: [0, 1], outputRange: [cfg.bubbleDistance * 0.7, -cfg.bubbleDistance - 12] });
  const b2Op = bubble2.interpolate({ inputRange: [0, 0.25, 0.8, 1], outputRange: [0, 0.85, 0.6, 0] });

  const b3Y = bubble3.interpolate({ inputRange: [0, 1], outputRange: [cfg.bubbleDistance * 0.5, -cfg.bubbleDistance - 6] });
  const b3Op = bubble3.interpolate({ inputRange: [0, 0.25, 0.8, 1], outputRange: [0, 0.75, 0.5, 0] });

  return (
    <View style={styles.container}>
      {/* Visual Animation Stage */}
      <View
        style={[
          styles.stage,
          {
            width: cfg.stageSize,
            height: cfg.stageSize,
          },
        ]}
      >
        {/* Layer 1: Warm Sunlit Amber/Aqua Ambient Glow */}
        <Animated.View
          style={[
            styles.auraGlow,
            {
              width: cfg.rippleSize * 1.35,
              height: cfg.rippleSize * 1.35,
              borderRadius: (cfg.rippleSize * 1.35) / 2,
              backgroundColor: isDark ? cyanColor + '25' : warmAmber + '22',
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />

        {/* Layer 2: Triple Concentric Fluid Water Ripples (ZERO SPIN) */}
        {/* Ripple 1: Sky Blue */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              width: cfg.rippleSize,
              height: cfg.rippleSize,
              borderRadius: cfg.rippleSize / 2,
              borderWidth: cfg.borderWidth,
              borderColor: skyColor + '70',
              backgroundColor: skyColor + '10',
              opacity: ripOpacity1,
              transform: [{ scale: ripScale1 }],
            },
          ]}
        />

        {/* Ripple 2: Warm Amber / Sunlit shimmer */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              width: cfg.rippleSize,
              height: cfg.rippleSize,
              borderRadius: cfg.rippleSize / 2,
              borderWidth: cfg.borderWidth - 0.5,
              borderColor: warmAmber + '65',
              backgroundColor: warmAmber + '0D',
              opacity: ripOpacity2,
              transform: [{ scale: ripScale2 }],
            },
          ]}
        />

        {/* Ripple 3: Pure Cyan Wave */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              width: cfg.rippleSize,
              height: cfg.rippleSize,
              borderRadius: cfg.rippleSize / 2,
              borderWidth: cfg.borderWidth - 0.5,
              borderColor: cyanColor + '60',
              backgroundColor: cyanColor + '0A',
              opacity: ripOpacity3,
              transform: [{ scale: ripScale3 }],
            },
          ]}
        />

        {/* Layer 3: Floating Aquatic Micro-Bubbles */}
        <Animated.View
          style={[
            styles.floatingBubble,
            {
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: warmAmber,
              left: (cfg.stageSize - cfg.podSize) / 2 - 10,
              opacity: b1Op,
              transform: [{ translateY: b1Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingBubble,
            {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: skyColor,
              right: (cfg.stageSize - cfg.podSize) / 2 - 8,
              opacity: b2Op,
              transform: [{ translateY: b2Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingBubble,
            {
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: cyanColor,
              left: cfg.stageSize / 2 + 10,
              opacity: b3Op,
              transform: [{ translateY: b3Y }],
            },
          ]}
        />

        {/* Layer 4: Floating Hero Water Droplet Pod (ZERO SPIN) */}
        <Animated.View
          style={[
            styles.dropletPod,
            {
              width: cfg.podSize,
              height: cfg.podSize,
              borderRadius: cfg.podSize * 0.42,
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              transform: [
                { translateY: dropTranslateY },
                { scaleX: dropScaleX },
                { scaleY: dropScaleY },
              ],
            },
          ]}
        >
          {/* Subtle Top-Left Glass Reflection Highlight */}
          <View
            style={[
              styles.glassShine,
              {
                width: cfg.podSize * 0.38,
                height: cfg.podSize * 0.18,
                borderRadius: cfg.podSize * 0.1,
              },
            ]}
          />

          {/* Hero Water Droplet Icon */}
          <Ionicons name="water" size={cfg.iconSize} color="#FFFFFF" />

          {/* Warm Sunlit Micro Glint */}
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

      {/* Layer 5: Polished Status Text & Bouncing Wave Dots (Only if message/dots requested) */}
      {(Boolean(message) || showDots) && (
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
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 4,
  },
  rippleCircle: {
    position: 'absolute',
  },
  floatingBubble: {
    position: 'absolute',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  dropletPod: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    zIndex: 10,
  },
  glassShine: {
    position: 'absolute',
    top: 5,
    left: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-35deg' }],
  },
  sparkleGlint: {
    position: 'absolute',
    top: 6,
    right: 7,
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
