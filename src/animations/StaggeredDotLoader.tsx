// StaggeredDotLoader — Three bouncing dots following a staggered wave pattern
// Ideal for inline loading, buttons, or card footers

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface StaggeredDotLoaderProps {
  size?: number;
  color?: string;
  spacing?: number;
}

const StaggeredDotLoader = memo<StaggeredDotLoaderProps>(({ size = 10, color, spacing = 6 }) => {
  const { theme } = useTheme();
  const activeColor = color || theme.colors.primary;

  // Animation values for three dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBouncingAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -8, // Bounce height (upwards)
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0, // Fall back down
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(300), // Pause before next bounce
        ])
      );
    };

    const anim1 = createBouncingAnimation(dot1, 0);
    const anim2 = createBouncingAnimation(dot2, 150);
    const anim3 = createBouncingAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.container, { height: size + 8 }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: activeColor,
            marginHorizontal: spacing / 2,
            transform: [{ translateY: dot1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: activeColor,
            marginHorizontal: spacing / 2,
            transform: [{ translateY: dot2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: activeColor,
            marginHorizontal: spacing / 2,
            transform: [{ translateY: dot3 }],
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    opacity: 0.9,
  },
});

export default StaggeredDotLoader;
