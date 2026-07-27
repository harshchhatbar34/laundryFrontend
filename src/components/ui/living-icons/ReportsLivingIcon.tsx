import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const ReportsLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 26 }) => {
  // Bar 1, 2, 3 scaleY
  const bar1Scale = useRef(new Animated.Value(1)).current;
  const bar2Scale = useRef(new Animated.Value(1)).current;
  const bar3Scale = useRef(new Animated.Value(1)).current;

  // Trend line opacity/draw
  const trendOpacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    if (focused) {
      // Tap Animation: Bars grow upward sequentially with overshoot
      bar1Scale.setValue(0.2);
      bar2Scale.setValue(0.2);
      bar3Scale.setValue(0.2);

      Animated.parallel([
        Animated.stagger(45, [
          Animated.spring(bar1Scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
          Animated.spring(bar2Scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
          Animated.spring(bar3Scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
        ]),
        Animated.timing(trendOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      bar1Scale.setValue(1);
      bar2Scale.setValue(1);
      bar3Scale.setValue(1);
      trendOpacity.setValue(0.6);
    }
  }, [focused, bar1Scale, bar2Scale, bar3Scale, trendOpacity]);

  // Idle Animation: Bar 2 grows by 1-2px before returning
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerIdleGrowth = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(bar2Scale, { toValue: 1.25, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(bar2Scale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerIdleGrowth, 6000 + Math.random() * 2000);
    };

    timer = setTimeout(triggerIdleGrowth, 4200);
    return () => clearTimeout(timer);
  }, [focused, bar2Scale]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Baseline */}
        <Path d="M3 20H21" stroke={color} strokeWidth="2" strokeLinecap="round" />

        {/* Bar 1 (Short) */}
        <AnimatedG style={{ transform: [{ scaleY: bar1Scale }], transformOrigin: '5.5px 20px' }}>
          <Rect
            x="4"
            y="13"
            width="3.5"
            height="7"
            rx="1.5"
            fill={focused ? color : 'none'}
            stroke={color}
            strokeWidth="1.8"
          />
        </AnimatedG>

        {/* Bar 2 (Medium - Animated on Idle) */}
        <AnimatedG style={{ transform: [{ scaleY: bar2Scale }], transformOrigin: '12px 20px' }}>
          <Rect
            x="10.25"
            y="8"
            width="3.5"
            height="12"
            rx="1.5"
            fill={focused ? color : 'none'}
            stroke={color}
            strokeWidth="1.8"
          />
        </AnimatedG>

        {/* Bar 3 (Tall) */}
        <AnimatedG style={{ transform: [{ scaleY: bar3Scale }], transformOrigin: '18.5px 20px' }}>
          <Rect
            x="16.5"
            y="4"
            width="3.5"
            height="16"
            rx="1.5"
            fill={focused ? color : 'none'}
            stroke={color}
            strokeWidth="1.8"
          />
        </AnimatedG>

        {/* Dynamic Growth Trend Arrow */}
        <AnimatedG style={{ opacity: trendOpacity }}>
          <Path
            d="M4 11L10 6L16 9L21 3"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M17.5 3H21V6.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
