/**
 * CartLivingIcon — Zomato-Style Cart Micro-Interaction (Fixed Layout)
 *
 * All animation contained within size×size bounds using overflow:hidden.
 * Animated.View wrappers on native thread (useNativeDriver: true).
 * No layout breaking — speed lines clipped within icon boundary.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const CartLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const cartX = useRef(new Animated.Value(0)).current;
  const cartRotate = useRef(new Animated.Value(0)).current;
  const linesOpacity = useRef(new Animated.Value(0)).current;
  const linesX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!focused) {
      cartX.setValue(0);
      cartRotate.setValue(0);
      linesOpacity.setValue(0);
      linesX.setValue(0);
      return;
    }

    cartX.setValue(0);
    cartRotate.setValue(0);
    linesOpacity.setValue(0);
    linesX.setValue(0);

    const NT = { useNativeDriver: true };

    Animated.sequence([
      // Phase 1: Anticipation — lean back (0–40ms)
      Animated.timing(cartRotate, {
        toValue: -1,
        duration: 40,
        easing: Easing.out(Easing.quad),
        ...NT,
      }),

      // Phase 2+3: Roll forward + speed lines (40–180ms)
      Animated.parallel([
        Animated.timing(cartX, {
          toValue: 5,
          duration: 130,
          easing: Easing.out(Easing.cubic),
          ...NT,
        }),
        Animated.timing(cartRotate, {
          toValue: 1.5,
          duration: 100,
          easing: Easing.out(Easing.quad),
          ...NT,
        }),
        // Speed lines: flash in then slide left and fade
        Animated.sequence([
          Animated.parallel([
            Animated.timing(linesOpacity, { toValue: 1, duration: 25, ...NT }),
            Animated.timing(linesX, {
              toValue: -6,
              duration: 120,
              easing: Easing.out(Easing.quad),
              ...NT,
            }),
          ]),
          Animated.timing(linesOpacity, {
            toValue: 0,
            duration: 80,
            easing: Easing.in(Easing.quad),
            ...NT,
          }),
        ]),
      ]),

      // Phase 4+5: Spring back with overshoot (180–300ms)
      Animated.parallel([
        Animated.spring(cartX, { toValue: 0, friction: 4, tension: 200, ...NT }),
        Animated.spring(cartRotate, { toValue: 0, friction: 5, tension: 180, ...NT }),
      ]),
    ]).start();
  }, [focused, cartX, cartRotate, linesOpacity, linesX]);

  // Gentle idle nudge every 6–8s while focused
  useEffect(() => {
    if (!focused) return;
    let timer: ReturnType<typeof setTimeout>;
    const NT = { useNativeDriver: true };
    const nudge = () => {
      Animated.sequence([
        Animated.timing(cartRotate, {
          toValue: 0.4,
          duration: 120,
          easing: Easing.out(Easing.quad),
          ...NT,
        }),
        Animated.spring(cartRotate, { toValue: 0, friction: 5, tension: 200, ...NT }),
      ]).start();
      timer = setTimeout(nudge, 6000 + Math.random() * 2000);
    };
    timer = setTimeout(nudge, 6500);
    return () => clearTimeout(timer);
  }, [focused, cartRotate]);

  const rotateDeg = cartRotate.interpolate({
    inputRange: [-1, 0, 1.5],
    outputRange: ['-2.5deg', '0deg', '1.5deg'],
  });

  const softFill = focused ? color + '22' : 'none';

  return (
    // Outer container — clips all children to prevent layout breaking
    <View style={[styles.wrap, { width: size, height: size }]}>

      {/* Speed lines — inside the icon bounds, left-anchored */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.lines,
          {
            opacity: linesOpacity,
            transform: [{ translateX: linesX }],
          },
        ]}
      >
        <Svg width={10} height={size} viewBox={`0 0 10 ${size}`} fill="none">
          <Path d="M1 7 H10" stroke={color} strokeWidth="1" strokeLinecap="round" />
          <Path d="M0 12 H10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <Path d="M1 17 H10" stroke={color} strokeWidth="1" strokeLinecap="round" />
        </Svg>
      </Animated.View>

      {/* Cart icon — rolls forward and tilts on native thread */}
      <Animated.View
        style={{
          transform: [
            { translateX: cartX },
            { rotate: rotateDeg },
          ],
        }}
      >
        <Svg width={size} height={size} viewBox="1 2 22 21" fill="none">
          {/* Basket */}
          <Path
            d="M2 3H4.5L7.1 14.3C7.2 14.7 7.6 15 8 15H18.4C18.8 15 19.2 14.7 19.3 14.3L21.5 6H6"
            stroke={color}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={softFill}
          />
          {/* Handle */}
          <Path d="M17 9H22" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
          {/* Rear wheel */}
          <Circle cx="8.5" cy="19.5" r="2" stroke={color} strokeWidth="1.1" fill={softFill} />
          <Path d="M8.5 17.5V21.5 M6.5 19.5H10.5" stroke={color} strokeWidth="0.9" />
          {/* Front wheel */}
          <Circle cx="17.5" cy="19.5" r="2" stroke={color} strokeWidth="1.1" fill={softFill} />
          <Path d="M17.5 17.5V21.5 M15.5 19.5H19.5" stroke={color} strokeWidth="0.9" />
        </Svg>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // prevents any child from breaking layout
  },
  lines: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  } as any,
});
