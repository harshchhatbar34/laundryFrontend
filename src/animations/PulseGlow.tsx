// PulseGlow — Pulsing glow circle for live status indication
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { palette } from '../theme/colors';

export interface PulseGlowProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const PulseGlow = memo<PulseGlowProps>(({
  size = 12,
  color = palette.mint,
  style,
  children,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );

    loopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      pulseAnim.setValue(0);
    };
  }, [pulseAnim]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3],
  });

  return (
    <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }, style]}>
      {/* Outer pulsing glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      {/* Solid inner dot */}
      <View
        style={[
          styles.innerDot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
      {/* Optional children overlay */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
});

PulseGlow.displayName = 'PulseGlow';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
  },
  innerDot: {
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  childrenContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PulseGlow;
