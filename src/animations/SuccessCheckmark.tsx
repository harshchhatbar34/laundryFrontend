// SuccessCheckmark — Animated circle + checkmark success indicator
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { palette } from '../theme/colors';

export interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
}

const SuccessCheckmark = memo<SuccessCheckmarkProps>(({
  size = 80,
  color = palette.mint,
  onComplete,
}) => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const checkShortLeg = useRef(new Animated.Value(0)).current;
  const checkLongLeg = useRef(new Animated.Value(0)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      // Step 1: Circle scales in with slight overshoot
      Animated.parallel([
        Animated.spring(circleScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: Short leg of checkmark draws
      Animated.timing(checkShortLeg, {
        toValue: 1,
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Step 3: Long leg of checkmark draws
      Animated.timing(checkLongLeg, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Step 4: Satisfying bounce
      Animated.sequence([
        Animated.timing(bounceScale, {
          toValue: 1.15,
          duration: 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });

    return () => {
      animation.stop();
    };
  }, [circleScale, circleOpacity, checkShortLeg, checkLongLeg, bounceScale, onComplete]);

  const checkmarkSize = size * 0.45;
  const strokeWidth = Math.max(2, size * 0.06);

  // Short leg dimensions (the smaller part of the check going down-left to bottom)
  const shortLegWidth = checkmarkSize * 0.4;
  const shortLegHeight = strokeWidth;

  // Long leg dimensions (the longer part going bottom to up-right)
  const longLegWidth = checkmarkSize * 0.75;
  const longLegHeight = strokeWidth;

  // Animated scale for "drawing" effect
  const shortLegScale = checkShortLeg.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const longLegScale = checkLongLeg.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: bounceScale }],
        },
      ]}
    >
      {/* Circle background */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          },
        ]}
      />

      {/* Checkmark container */}
      <View
        style={[
          styles.checkmarkContainer,
          {
            width: checkmarkSize,
            height: checkmarkSize,
            // Offset slightly left and down for visual centering of check
            left: size * 0.27,
            top: size * 0.3,
          },
        ]}
      >
        {/* Short leg (bottom-left part) */}
        <Animated.View
          style={[
            styles.checkLeg,
            {
              width: shortLegWidth,
              height: shortLegHeight,
              backgroundColor: '#FFFFFF',
              borderRadius: strokeWidth / 2,
              bottom: checkmarkSize * 0.3,
              left: 0,
              transform: [
                { rotate: '45deg' },
                { scaleX: shortLegScale },
              ],
              transformOrigin: 'left center',
            } as any,
          ]}
        />
        {/* Long leg (bottom-right going up) */}
        <Animated.View
          style={[
            styles.checkLeg,
            {
              width: longLegWidth,
              height: longLegHeight,
              backgroundColor: '#FFFFFF',
              borderRadius: strokeWidth / 2,
              bottom: checkmarkSize * 0.3,
              left: shortLegWidth * 0.55,
              transform: [
                { rotate: '-45deg' },
                { scaleX: longLegScale },
              ],
              transformOrigin: 'left center',
            } as any,
          ]}
        />
      </View>
    </Animated.View>
  );
});

SuccessCheckmark.displayName = 'SuccessCheckmark';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  checkmarkContainer: {
    position: 'absolute',
  },
  checkLeg: {
    position: 'absolute',
  },
});

export default SuccessCheckmark;
