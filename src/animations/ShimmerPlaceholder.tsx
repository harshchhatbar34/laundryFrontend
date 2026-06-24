// ShimmerPlaceholder — Skeleton loading shimmer effect
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { palette } from '../theme/colors';

export interface ShimmerPlaceholderProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  shimmerColor?: string;
  baseColor?: string;
}

const ShimmerPlaceholder = memo<ShimmerPlaceholderProps>(({
  width: propWidth = 200,
  height = 16,
  borderRadius = 8,
  style,
  shimmerColor = 'rgba(255, 255, 255, 0.4)',
  baseColor = palette.gray200,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    );

    loopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      translateX.setValue(0);
    };
  }, [translateX]);

  // Shimmer sweep: moves a bright band from left edge to right edge
  const shimmerWidth = propWidth * 0.6;
  const animatedTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, propWidth + shimmerWidth],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: propWidth,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: shimmerWidth,
            height,
            transform: [{ translateX: animatedTranslateX } as any],
          },
        ]}
      >
        {/* 3-part shimmer band: fade-in, bright center, fade-out */}
        <View style={styles.shimmerBand}>
          <View
            style={[
              styles.shimmerEdge,
              { backgroundColor: shimmerColor, opacity: 0 },
            ]}
          />
          <View
            style={[
              styles.shimmerCenter,
              { backgroundColor: shimmerColor },
            ]}
          />
          <View
            style={[
              styles.shimmerEdge,
              { backgroundColor: shimmerColor, opacity: 0 },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
});

ShimmerPlaceholder.displayName = 'ShimmerPlaceholder';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  shimmerBand: {
    flex: 1,
    flexDirection: 'row',
  },
  shimmerEdge: {
    flex: 1,
  },
  shimmerCenter: {
    flex: 2,
  },
});

export default ShimmerPlaceholder;
