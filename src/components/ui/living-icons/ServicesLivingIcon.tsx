import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const ServicesLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  // Gear rotation (90° = 1)
  const gearRot = useRef(new Animated.Value(0)).current;

  // Wrench tilt
  const wrenchRot = useRef(new Animated.Value(0)).current;

  // Sparkle scale
  const sparkleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(gearRot, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(wrenchRot, { toValue: -0.2, duration: 90, useNativeDriver: true }),
          Animated.spring(wrenchRot, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(sparkleScale, { toValue: 1.2, duration: 160, useNativeDriver: true }),
          Animated.spring(sparkleScale, { toValue: focused ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      gearRot.setValue(0);
      wrenchRot.setValue(0);
      sparkleScale.setValue(0);
    }
  }, [focused, gearRot, wrenchRot, sparkleScale]);

  // Idle animation: Gear nudges 5°
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerNudge = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(gearRot, { toValue: 0.08, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(gearRot, { toValue: 0, duration: 250, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerNudge, 6000 + Math.random() * 2000);
    };

    timer = setTimeout(triggerNudge, 4500);
    return () => clearTimeout(timer);
  }, [focused, gearRot]);

  const gearInterpolate = gearRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const wrenchInterpolate = wrenchRot.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-45deg', '45deg'],
  });

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main Rotating Gear */}
        <G x={10} y={10}>
          <AnimatedG style={{ transform: [{ rotate: gearInterpolate }] }}>
            <G x={-10} y={-10}>
              <Circle cx="10" cy="10" r="4" stroke={color} strokeWidth="2" fill={softFill} />
              {/* Gear teeth */}
              <Path
                d="M10 2V4 M10 16V18 M2 10H4 M16 10H18 M4.34 4.34L5.76 5.76 M14.24 14.24L15.66 15.66 M4.34 15.66L5.76 14.24 M14.24 5.76L15.66 4.34"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </G>
          </AnimatedG>
        </G>

        {/* Tilting Wrench overlay - Clean stroke outline */}
        <G x={17} y={17}>
          <AnimatedG style={{ transform: [{ rotate: wrenchInterpolate }] }}>
            <G x={-17} y={-17}>
              <Path
                d="M14.7 14.7L19.5 19.5 M17 12.5C18.5 11 20.8 11.2 21.8 12.8C22.4 13.8 22.2 15 21.5 15.8L19.8 14.1L18.4 15.5L20.1 17.2C19.3 17.9 18.1 18.1 17.1 17.5C15.5 16.5 15.3 14.2 16.8 12.7L17 12.5Z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={softFill}
              />
            </G>
          </AnimatedG>
        </G>

        {/* Sparkle pop */}
        <G x={19} y={4.5}>
          <AnimatedG style={{ transform: [{ scale: sparkleScale }] }}>
            <G x={-19} y={-4.5}>
              <Path
                d="M19 2L19.5 4L21.5 4.5L19.5 5L19 7L18.5 5L16.5 4.5L18.5 4L19 2Z"
                fill="#F59E0B"
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
