import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);
const AnimatedPath = Animated.createAnimatedComponent(Path as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const BranchesLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const bldgLeftX = useRef(new Animated.Value(0)).current;
  const bldgRightX = useRef(new Animated.Value(0)).current;

  const pinY = useRef(new Animated.Value(0)).current;
  const lineScale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bldgLeftX, { toValue: -1.5, duration: 80, useNativeDriver: true }),
          Animated.spring(bldgLeftX, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bldgRightX, { toValue: 1.5, duration: 80, useNativeDriver: true }),
          Animated.spring(bldgRightX, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.spring(pinY, { toValue: -4, friction: 3, tension: 220, useNativeDriver: true }),
          Animated.spring(pinY, { toValue: 0, friction: 5, tension: 160, useNativeDriver: true }),
        ]),
        Animated.timing(lineScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      bldgLeftX.setValue(0);
      bldgRightX.setValue(0);
      pinY.setValue(0);
      lineScale.setValue(0);
    }
  }, [focused, bldgLeftX, bldgRightX, pinY, lineScale]);

  // Idle animation: Pin bobs up and down
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const triggerBob = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(pinY, { toValue: -2.5, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pinY, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerBob, 5500 + Math.random() * 1500);
    };

    timer = setTimeout(triggerBob, 3500);
    return () => clearTimeout(timer);
  }, [focused, pinY]);

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Expanded viewBox="-1 -3 26 27" so hopping pin never clips at top */}
      <Svg width={size} height={size} viewBox="-1 -3 26 27" fill="none">
        {/* Left Store Building */}
        <AnimatedG style={{ transform: [{ translateX: bldgLeftX }] }}>
          <Rect x="2" y="11" width="7" height="10" rx="1.5" fill={softFill} stroke={color} strokeWidth="1.1" />
          <Path d="M1.5 11L5.5 8L9.5 11" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </AnimatedG>

        {/* Right Store Building */}
        <AnimatedG style={{ transform: [{ translateX: bldgRightX }] }}>
          <Rect x="15" y="11" width="7" height="10" rx="1.5" fill={softFill} stroke={color} strokeWidth="1.1" />
          <Path d="M14.5 11L18.5 8L22.5 11" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </AnimatedG>

        {/* Connecting Line */}
        <AnimatedPath
          d="M9 16H15"
          stroke={color}
          strokeWidth="1.1"
          strokeDasharray="2 2"
          strokeLinecap="round"
          style={{ opacity: lineScale }}
        />

        {/* Location Pin */}
        <AnimatedG style={{ transform: [{ translateY: pinY }] }}>
          <Path
            d="M12 2C10.3 2 9 3.3 9 5C9 7.2 12 10.5 12 10.5C12 10.5 15 7.2 15 5C15 3.3 13.7 2 12 2Z"
            fill={color}
            stroke={color}
            strokeWidth="1.1"
          />
          <Circle cx="12" cy="5" r="1.2" fill="#FFF" />
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
