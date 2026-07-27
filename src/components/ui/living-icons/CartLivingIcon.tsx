import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const CartLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const rollX = useRef(new Animated.Value(0)).current;
  const compressY = useRef(new Animated.Value(0)).current;
  const wheelRot = useRef(new Animated.Value(0)).current;
  const frontWheelIdleRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
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

  // Idle Animation: Front wheel rotates 30°
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

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main Cart Body */}
        <AnimatedG style={{ transform: [{ translateX: rollX }, { translateY: compressY }] }}>
          {/* Cart basket */}
          <Path
            d="M2 3H4.5L7.1 14.3C7.2 14.7 7.6 15 8 15H18.4C18.8 15 19.2 14.7 19.3 14.3L21.5 6H6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={softFill}
          />

          <Path d="M16 9H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

          {/* Rear Wheel */}
          <G x={8.5} y={19.5}>
            <AnimatedG style={{ transform: [{ rotate: wheelRotateInterpolate }] }}>
              <G x={-8.5} y={-19.5}>
                <Circle cx="8.5" cy="19.5" r="2" fill={softFill} stroke={color} strokeWidth="2" />
                <Path d="M8.5 17.5V21.5" stroke={color} strokeWidth="1" />
              </G>
            </AnimatedG>
          </G>

          {/* Front Wheel */}
          <G x={17.5} y={19.5}>
            <AnimatedG
              style={{
                transform: [{ rotate: focused ? wheelRotateInterpolate : frontWheelIdleInterpolate }],
              }}
            >
              <G x={-17.5} y={-19.5}>
                <Circle cx="17.5" cy="19.5" r="2" fill={softFill} stroke={color} strokeWidth="2" />
                <Path d="M17.5 17.5V21.5" stroke={color} strokeWidth="1" />
              </G>
            </AnimatedG>
          </G>
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
