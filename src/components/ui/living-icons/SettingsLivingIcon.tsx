/**
 * SettingsLivingIcon — Dual Toggle Switches Icon (Option 4)
 *
 * 2 horizontal toggle switch pill tracks with interactive sliding knobs.
 * 1.1px stroke outline with smooth toggle flip animation on tap.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);
const AnimatedRect = Animated.createAnimatedComponent(Rect as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const SettingsLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const toggle1X = useRef(new Animated.Value(focused ? 16 : 8)).current;
  const toggle2X = useRef(new Animated.Value(focused ? 8 : 16)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(toggle1X, { toValue: 16, friction: 5, tension: 160, useNativeDriver: true }),
        Animated.spring(toggle2X, { toValue: 8, friction: 5, tension: 160, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(toggle1X, { toValue: 8, friction: 6, tension: 140, useNativeDriver: true }),
        Animated.spring(toggle2X, { toValue: 16, friction: 6, tension: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [focused, toggle1X, toggle2X]);

  // Idle Animation: Toggle 1 flicks gently
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerFlick = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(toggle1X, { toValue: 12, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(toggle1X, { toValue: 8, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerFlick, 5500 + Math.random() * 2000);
    };

    timer = setTimeout(triggerFlick, 3600);
    return () => clearTimeout(timer);
  }, [focused, toggle1X]);

  const softFill1 = focused ? color + '33' : 'none';
  const softFill2 = focused ? 'none' : color + '22';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Top Toggle Switch Track */}
        <Rect
          x="3.5"
          y="4.5"
          width="17"
          height="7"
          rx="3.5"
          fill={softFill1}
          stroke={color}
          strokeWidth="1.1"
        />
        <AnimatedCircle cx={toggle1X} cy="8" r="2.2" fill={color} />

        {/* Bottom Toggle Switch Track */}
        <Rect
          x="3.5"
          y="13.5"
          width="17"
          height="7"
          rx="3.5"
          fill={softFill2}
          stroke={color}
          strokeWidth="1.1"
        />
        <AnimatedCircle cx={toggle2X} cy="17" r="2.2" fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
