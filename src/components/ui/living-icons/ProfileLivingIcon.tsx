/**
 * ProfileLivingIcon — Living Person / User Profile Icon for Customer Tabs
 *
 * Modern user avatar silhouette with 1.1px stroke and interactive head/body spring animation.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const ProfileLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const headY = useRef(new Animated.Value(0)).current;
  const bodyScaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(headY, { toValue: -2, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(headY, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bodyScaleY, { toValue: 1.08, duration: 120, useNativeDriver: true }),
          Animated.spring(bodyScaleY, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      headY.setValue(0);
      bodyScaleY.setValue(1);
    }
  }, [focused, headY, bodyScaleY]);

  // Idle animation: Head bobs gently
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const triggerBob = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(headY, { toValue: -1.2, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(headY, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerBob, 5500 + Math.random() * 2000);
    };

    timer = setTimeout(triggerBob, 3800);
    return () => clearTimeout(timer);
  }, [focused, headY]);

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Animated Head Circle */}
        <G x={12} y={7.5}>
          <AnimatedG style={{ transform: [{ translateY: headY }] }}>
            <G x={-12} y={-7.5}>
              <Circle cx="12" cy="7.5" r="4" fill={softFill} stroke={color} strokeWidth="1.1" />
            </G>
          </AnimatedG>
        </G>

        {/* Animated Body Arc */}
        <G x={12} y={20}>
          <AnimatedG style={{ transform: [{ scaleY: bodyScaleY }] }}>
            <G x={-12} y={-20}>
              <Path
                d="M4 20C4 15.5 7.5 13.5 12 13.5C16.5 13.5 20 15.5 20 20"
                stroke={color}
                strokeWidth="1.1"
                strokeLinecap="round"
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
