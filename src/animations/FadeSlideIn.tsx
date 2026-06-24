// FadeSlideIn — Fade + slide up entrance animation
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, memo } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

export interface FadeSlideInProps {
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const FadeSlideIn = memo<FadeSlideInProps>(({
  delay = 0,
  duration = 400,
  distance = 20,
  style,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Smooth deceleration
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, translateY, delay, duration, distance]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
});

FadeSlideIn.displayName = 'FadeSlideIn';

export default FadeSlideIn;
