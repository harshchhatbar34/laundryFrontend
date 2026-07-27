/**
 * ServicesLivingIcon — Living Laundry Washing Machine & Bubbles Icon
 *
 * Ultra-sleek 1.1px stroke washing machine with animated water/bubbles.
 * Perfectly represents laundry services for Qwasho.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);
const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const ServicesLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const spinRot = useRef(new Animated.Value(0)).current;
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // Spin drum + float bubbles
      Animated.parallel([
        Animated.timing(spinRot, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(bubble1Y, { toValue: -3, friction: 4, tension: 160, useNativeDriver: true }),
        Animated.spring(bubble2Y, { toValue: -4, friction: 5, tension: 140, useNativeDriver: true }),
      ]).start();
    } else {
      spinRot.setValue(0);
      bubble1Y.setValue(0);
      bubble2Y.setValue(0);
    }
  }, [focused, spinRot, bubble1Y, bubble2Y]);

  // Idle Animation: Drum twitches & bubble floats
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerIdle = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(spinRot, { toValue: 0.15, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(spinRot, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerIdle, 5000 + Math.random() * 2000);
    };

    timer = setTimeout(triggerIdle, 3500);
    return () => clearTimeout(timer);
  }, [focused, spinRot]);

  const spinInterpolate = spinRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main Washing Machine Outer Frame */}
        <Rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          fill={softFill}
          stroke={color}
          strokeWidth="1.1"
        />

        {/* Top Control Panel Line & Buttons */}
        <Path d="M3 7.5H21" stroke={color} strokeWidth="1.1" />
        <Circle cx="6.5" cy="5.25" r="0.8" fill={color} />
        <Circle cx="9.5" cy="5.25" r="0.8" fill={color} />
        <Rect x="15" y="4.5" width="3" height="1.5" rx="0.75" stroke={color} strokeWidth="1.1" />

        {/* Washing Drum Door & Inner Spin Wave */}
        <G x={12} y={14}>
          <AnimatedG style={{ transform: [{ rotate: spinInterpolate }] }}>
            <G x={-12} y={-14}>
              {/* Outer Door Ring */}
              <Circle cx="12" cy="14" r="5" stroke={color} strokeWidth="1.1" fill={softFill} />
              {/* Inner Drum Glass Arc */}
              <Path
                d="M9.5 13.5C10 14.5 11 15 12 15C13 15 14 14.5 14.5 13.5"
                stroke={color}
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </G>
          </AnimatedG>
        </G>

        {/* Floating Bubble 1 */}
        <AnimatedG style={{ transform: [{ translateY: bubble1Y }] }}>
          <Circle cx="18" cy="4" r="1.5" stroke={color} strokeWidth="1.1" fill={softFill} />
        </AnimatedG>

        {/* Floating Bubble 2 */}
        <AnimatedG style={{ transform: [{ translateY: bubble2Y }] }}>
          <Circle cx="20.5" cy="8" r="1" stroke={color} strokeWidth="1.1" fill={softFill} />
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
