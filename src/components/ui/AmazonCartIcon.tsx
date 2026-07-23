/**
 * AmazonCartIcon — Custom SVG cart icon modelled after Amazon's iconic
 * compact shopping cart design (thick handle, chunky basket, two wheels).
 *
 * Uses react-native-svg (already in the project).
 * Supports outline / filled states and an animated "bounce" on press.
 */

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface AmazonCartIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export const AmazonCartIcon: React.FC<AmazonCartIconProps> = ({
  size = 24,
  color = '#64748B',
  filled = false,
}) => {
  const strokeW = size < 22 ? 1.6 : 1.8;

  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* Handle bar */}
        <Path
          d="M2 2h2l0.8 2H20a1 1 0 0 1 0.95 1.31l-2 6A1 1 0 0 1 18 12H8l0.5 2H18a1 1 0 1 1 0 2H7a1 1 0 0 1-0.97-0.76L4.2 6H2V2z"
          fill={color}
        />
        {/* Wheel left */}
        <Circle cx="9" cy="19.5" r="1.5" fill={color} />
        {/* Wheel right */}
        <Circle cx="17" cy="19.5" r="1.5" fill={color} />
        {/* Item dot in cart */}
        <Circle cx="13" cy="8.5" r="1" fill="white" opacity={0.6} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Handle + body — Amazon style: handle goes diagonally from top-left */}
      <Path
        d="M2 3h1.5l0.72 1.8M4.8 7l1.6 6.4a1 1 0 0 0 0.97 0.76H17a1 1 0 0 0 0.95-0.68l1.8-5.4A1 1 0 0 0 18.8 7H4.8z"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle stem */}
      <Path
        d="M2 3h1.5l0.72 1.8"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {/* Connector */}
      <Path
        d="M4.22 4.8H19a1 1 0 0 1 0.95 1.32l-2 6A1 1 0 0 1 17 13H7.5"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom of basket */}
      <Path
        d="M7.5 13L8.5 16H17"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left wheel */}
      <Circle cx="9.5" cy="19" r="1.2" stroke={color} strokeWidth={strokeW} />
      {/* Right wheel */}
      <Circle cx="16.5" cy="19" r="1.2" stroke={color} strokeWidth={strokeW} />
    </Svg>
  );
};

/**
 * AnimatedAmazonCartIcon — wraps AmazonCartIcon with a spring bounce
 * animation when focused state changes. Use inside tabBarIcon.
 */
interface AnimatedAmazonCartIconProps extends AmazonCartIconProps {
  focused: boolean;
  badgeCount?: number;
}

export const AnimatedAmazonCartIcon: React.FC<AnimatedAmazonCartIconProps> = ({
  focused,
  size = 24,
  color,
  badgeCount,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // On focus: quick wobble then settle
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.25,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Slight tilt then back
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          friction: 4,
          tension: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate }] }}>
      <AmazonCartIcon size={size} color={color} filled={focused} />
    </Animated.View>
  );
};
