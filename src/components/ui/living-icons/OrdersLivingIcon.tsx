import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const OrdersLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const boxScaleY = useRef(new Animated.Value(1)).current;
  const receiptY = useRef(new Animated.Value(0)).current;
  const lidRotate = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(boxScaleY, { toValue: 0.88, duration: 40, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(boxScaleY, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
          Animated.spring(receiptY, { toValue: -5, friction: 5, tension: 160, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(lidRotate, { toValue: -1, duration: 90, useNativeDriver: true }),
            Animated.spring(lidRotate, { toValue: 0, friction: 6, tension: 140, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(80),
            Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    } else {
      boxScaleY.setValue(1);
      receiptY.setValue(0);
      lidRotate.setValue(0);
      checkScale.setValue(0);
    }
  }, [focused, boxScaleY, receiptY, lidRotate, checkScale]);

  // Idle Animation: Receipt peeks out 2px
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const triggerPeek = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(receiptY, { toValue: -2, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(receiptY, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerPeek, 6500 + Math.random() * 1500);
    };

    timer = setTimeout(triggerPeek, 4000);
    return () => clearTimeout(timer);
  }, [focused, receiptY]);

  const lidInterpolate = lidRotate.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-30deg', '0deg'],
  });

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Expanded viewBox="0 -4 24 28" so receipt sliding up -5px never clips */}
      <Svg width={size} height={size} viewBox="0 -4 24 28" fill="none">
        {/* Receipt sliding out from box */}
        <AnimatedG style={{ transform: [{ translateY: receiptY }] }}>
          <Rect
            x="7"
            y="6"
            width="10"
            height="9"
            rx="1.5"
            fill={softFill}
            stroke={color}
            strokeWidth="1.1"
          />
          {/* Lines on receipt */}
          <Path d="M9 8.5H15 M9 10.5H13" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
          {/* Green Checkmark */}
          <G x={12} y={10}>
            <AnimatedG style={{ transform: [{ scale: checkScale }] }}>
              <G x={-12} y={-10}>
                <Path d="M9.5 11L11 12.5L14.5 9" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </G>
            </AnimatedG>
          </G>
        </AnimatedG>

        {/* Box Body with compression */}
        <G x={12} y={21}>
          <AnimatedG style={{ transform: [{ scaleY: boxScaleY }] }}>
            <G x={-12} y={-21}>
              <Rect
                x="3"
                y="12"
                width="18"
                height="9"
                rx="2"
                fill={softFill}
                stroke={color}
                strokeWidth="1.1"
              />
              {/* Vertical box tape */}
              <Path d="M12 12V21" stroke={color} strokeWidth="1.1" strokeDasharray="1.5 1.5" />

              {/* Box Flap/Lid with rotation */}
              <G x={3} y={12}>
                <AnimatedG style={{ transform: [{ rotate: lidInterpolate }] }}>
                  <G x={-3} y={-12}>
                    <Path
                      d="M3 12L12 15L21 12"
                      stroke={color}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </G>
                </AnimatedG>
              </G>
            </G>
          </AnimatedG>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
