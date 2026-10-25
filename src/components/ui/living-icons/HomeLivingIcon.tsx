/**
 * HomeLivingIcon — Living Home House Icon for Customer Tabs
 *
 * Modern house outline with 1.1px stroke and interactive roof/door spring animation.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);
const AnimatedPath = Animated.createAnimatedComponent(Path as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const HomeLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const roofY = useRef(new Animated.Value(0)).current;
  const doorScaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(roofY, { toValue: -2.5, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(roofY, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(doorScaleY, { toValue: 1.15, duration: 120, useNativeDriver: true }),
          Animated.spring(doorScaleY, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      roofY.setValue(0);
      doorScaleY.setValue(1);
    }
  }, [focused, roofY, doorScaleY]);

  // Idle animation: Roof bobs gently
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const triggerBob = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(roofY, { toValue: -1.5, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(roofY, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerBob, 5500 + Math.random() * 2000);
    };

    timer = setTimeout(triggerBob, 3800);
    return () => clearTimeout(timer);
  }, [focused, roofY]);

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* House Walls & Base */}
        <Path
          d="M5 9.5V19.5C5 20.3 5.7 21 6.5 21H17.5C18.3 21 19 20.3 19 19.5V9.5"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={softFill}
        />

        {/* Animated Roof Peak */}
        <AnimatedG style={{ transform: [{ translateY: roofY }] }}>
          <Path
            d="M3 10.5L12 3L21 10.5"
            stroke={color}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Chimney */}
          <Path d="M17 6.5V4H19V8" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        </AnimatedG>

        {/* Animated House Door */}
        <G x={12} y={21}>
          <AnimatedG style={{ transform: [{ scaleY: doorScaleY }] }}>
            <G x={-12} y={-21}>
              <Path
                d="M9.5 21V14.5C9.5 13.7 10.2 13 11 13H13C13.8 13 14.5 13.7 14.5 14.5V21"
                stroke={color}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={softFill}
              />
            </G>
          </AnimatedG>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
