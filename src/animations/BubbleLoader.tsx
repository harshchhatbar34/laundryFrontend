// BubbleLoader — Floating soap bubble loader animation
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, useMemo, memo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { palette } from '../theme/colors';

const BUBBLE_COLORS = [
  palette.azure,
  palette.azureLight,
  palette.mint,
  palette.mintLight,
  palette.azureDark,
  palette.mintDark,
];

const CONTAINER_SIZES = {
  small: 40,
  medium: 80,
  large: 120,
};

const BUBBLE_CONFIGS = [
  { size: 10, startX: 0.2, delay: 0, duration: 2400, wobbleAmp: 8 },
  { size: 16, startX: 0.5, delay: 300, duration: 2800, wobbleAmp: 12 },
  { size: 8, startX: 0.75, delay: 600, duration: 2200, wobbleAmp: 6 },
  { size: 14, startX: 0.35, delay: 900, duration: 2600, wobbleAmp: 10 },
  { size: 20, startX: 0.6, delay: 150, duration: 3000, wobbleAmp: 14 },
  { size: 12, startX: 0.85, delay: 450, duration: 2500, wobbleAmp: 9 },
];

export interface BubbleLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const BubbleLoader = memo<BubbleLoaderProps>(({ size = 'medium', color }) => {
  const containerSize = CONTAINER_SIZES[size] || CONTAINER_SIZES.medium;

  // Create refs for all 6 bubbles
  const animations = useRef(
    BUBBLE_CONFIGS.map(() => ({
      progress: new Animated.Value(0),
    }))
  ).current;

  const loopRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    loopRefs.current = animations.map((anim, index) => {
      const config = BUBBLE_CONFIGS[index];

      const loop = Animated.loop(
        Animated.sequence([
          // Stagger delay before first cycle
          Animated.delay(config.delay),
          Animated.timing(anim.progress, {
            toValue: 1,
            duration: config.duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(anim.progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      loop.start();
      return loop;
    });

    return () => {
      loopRefs.current.forEach((loop) => loop.stop());
      animations.forEach((anim) => anim.progress.setValue(0));
    };
  }, [animations]);

  const bubbles = useMemo(() => {
    return BUBBLE_CONFIGS.map((config, index) => {
      const { progress } = animations[index];
      const bubbleColor = color || BUBBLE_COLORS[index % BUBBLE_COLORS.length];

      // Rise from bottom to top
      const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [containerSize * 0.4, -containerSize * 0.5],
      });

      // Sinusoidal horizontal wobble (approximate with keyframes)
      const translateX = progress.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [
          0,
          config.wobbleAmp,
          0,
          -config.wobbleAmp,
          0,
        ],
      });

      // Scale: grow slightly then shrink/pop at end
      const scale = progress.interpolate({
        inputRange: [0, 0.1, 0.7, 0.9, 1],
        outputRange: [0.3, 1, 1.1, 0.6, 0],
        extrapolate: 'clamp',
      });

      // Opacity: fade in, stay, then pop out
      const opacity = progress.interpolate({
        inputRange: [0, 0.1, 0.8, 1],
        outputRange: [0, 0.7, 0.6, 0],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.bubble,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
              backgroundColor: bubbleColor,
              left: config.startX * (containerSize - config.size),
              opacity,
              transform: [{ translateY }, { translateX }, { scale }],
            },
          ]}
        >
          {/* Inner shine highlight */}
          <View
            style={[
              styles.bubbleShine,
              {
                width: config.size * 0.35,
                height: config.size * 0.35,
                borderRadius: (config.size * 0.35) / 2,
              },
            ]}
          />
        </Animated.View>
      );
    });
  }, [animations, color, containerSize]);

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
        },
      ]}
    >
      {bubbles}
    </View>
  );
});

BubbleLoader.displayName = 'BubbleLoader';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bubble: {
    position: 'absolute',
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bubbleShine: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});

export default BubbleLoader;
