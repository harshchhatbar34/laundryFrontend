import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const CartLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 26 }) => {
  // Cart body forward roll (translateX 0 -> 7px -> 0)
  const rollX = useRef(new Animated.Value(0)).current;

  // Cart suspension compression (translateY & scaleY)
  const compressY = useRef(new Animated.Value(0)).current;

  // Wheels rotation
  const wheelRot = useRef(new Animated.Value(0)).current;

  // Front wheel idle twitch
  const frontWheelIdleRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // Tap Animation:
      // 1. Compress suspension (0-40ms)
      // 2. Roll forward + rotate wheels (120-180ms)
      // 3. Overshoot & return home naturally (spring settle)
      Animated.sequence([
        Animated.timing(compressY, { toValue: 2, duration: 40, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(compressY, { toValue: 0, friction: 5, tension: 180, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(rollX, { toValue: 6, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.spring(rollX, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(wheelRot, { toValue: 1, duration: 130, useNativeDriver: true }),
            Animated.spring(wheelRot, { toValue: 0, friction: 5, tension: 140, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    } else {
      rollX.setValue(0);
      compressY.setValue(0);
      wheelRot.setValue(0);
    }
  }, [focused, rollX, compressY, wheelRot]);

  // Idle Animation: Front wheel rotates 30° before stopping
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerWheelTwitch = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(frontWheelIdleRot, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(frontWheelIdleRot, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerWheelTwitch, 5500 + Math.random() * 2000);
    };

    timer = setTimeout(triggerWheelTwitch, 3800);
    return () => clearTimeout(timer);
  }, [focused, frontWheelIdleRot]);

  const wheelRotateInterpolate = wheelRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const frontWheelIdleInterpolate = frontWheelIdleRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main Cart Body with roll & compression */}
        <AnimatedG style={{ transform: [{ translateX: rollX }, { translateY: compressY }] }}>
          {/* Cart basket */}
          <Path
            d="M2 3H4.5L7.1 14.3C7.2 14.7 7.6 15 8 15H18.4C18.8 15 19.2 14.7 19.3 14.3L21.5 6H6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color + '25' : 'none'}
          />

          {/* Cart handle accent */}
          <Path d="M16 9H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

          {/* Rear Wheel */}
          <AnimatedG style={{ transform: [{ rotate: wheelRotateInterpolate }], transformOrigin: '8.5px 19.5px' }}>
            <Circle cx="8.5" cy="19.5" r="2" fill={focused ? color : 'none'} stroke={color} strokeWidth="2" />
            <Path d="M8.5 17.5V21.5" stroke={color} strokeWidth="1" />
          </AnimatedG>

          {/* Front Wheel with idle rotation */}
          <AnimatedG
            style={{
              transform: [{ rotate: focused ? wheelRotateInterpolate : frontWheelIdleInterpolate }],
              transformOrigin: '17.5px 19.5px',
            }}
          >
            <Circle cx="17.5" cy="19.5" r="2" fill={focused ? color : 'none'} stroke={color} strokeWidth="2" />
            <Path d="M17.5 17.5V21.5" stroke={color} strokeWidth="1" />
          </AnimatedG>
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
