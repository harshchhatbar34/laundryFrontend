import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const SettingsLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 26 }) => {
  // Gear rotation (0 to 1 = 90deg)
  const gearRot = useRef(new Animated.Value(0)).current;

  // Mechanical scale twitch
  const clickScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Tap Animation: 90° mechanical rotate with slight overshoot and click
      Animated.parallel([
        Animated.spring(gearRot, {
          toValue: 1,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(clickScale, { toValue: 1.12, duration: 60, useNativeDriver: true }),
          Animated.spring(clickScale, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      gearRot.setValue(0);
      clickScale.setValue(1);
    }
  }, [focused, gearRot, clickScale]);

  // Idle Animation: Gear twitches 3-5° occasionally
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerTwitch = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(gearRot, { toValue: 0.05, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(gearRot, { toValue: -0.04, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(gearRot, { toValue: 0, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerTwitch, 5500 + Math.random() * 2000);
    };

    timer = setTimeout(triggerTwitch, 3600);
    return () => clearTimeout(timer);
  }, [focused, gearRot]);

  const gearInterpolate = gearRot.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-90deg', '0deg', '90deg'],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <AnimatedG
          style={{
            transform: [{ rotate: gearInterpolate }, { scale: clickScale }],
            transformOrigin: '12px 12px',
          }}
        >
          {/* Outer mechanical gear teeth */}
          <Path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            fill={focused ? color : 'none'}
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M19.4 15A1.65 1.65 0 0 0 20 12A1.65 1.65 0 0 0 19.4 9L21.3 7.5L19.3 4.1L17 5.1A1.65 1.65 0 0 0 14.4 3.6L14 1.2H10L9.6 3.6A1.65 1.65 0 0 0 7 5.1L4.7 4.1L2.7 7.5L4.6 9A1.65 1.65 0 0 0 4.6 12A1.65 1.65 0 0 0 4 15L2.1 16.5L4.1 19.9L6.4 18.9A1.65 1.65 0 0 0 9 20.4L9.4 22.8H13.4L13.8 20.4A1.65 1.65 0 0 0 16.4 18.9L18.7 19.9L20.7 16.5L19.4 15Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner core circle */}
          <Circle cx="12" cy="12" r="2" fill={focused ? '#FFF' : color} />
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
