import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G as any);

interface LivingIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export const DashboardLivingIcon: React.FC<LivingIconProps> = ({ focused, color, size = 24 }) => {
  const card1Y = useRef(new Animated.Value(0)).current;
  const card2Y = useRef(new Animated.Value(0)).current;
  const card3Y = useRef(new Animated.Value(0)).current;

  const idleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      card1Y.setValue(3);
      card2Y.setValue(3);
      card3Y.setValue(3);

      Animated.stagger(40, [
        Animated.spring(card1Y, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
        Animated.spring(card2Y, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
        Animated.spring(card3Y, { toValue: 0, friction: 4, tension: 180, useNativeDriver: true }),
      ]).start();
    } else {
      card1Y.setValue(0);
      card2Y.setValue(0);
      card3Y.setValue(0);
    }
  }, [focused, card1Y, card2Y, card3Y]);

  // Idle animation every 6 seconds: card 2 pulses
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const triggerIdle = () => {
      if (!focused) {
        Animated.sequence([
          Animated.timing(idleScale, { toValue: 1.15, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(idleScale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        ]).start();
      }
      timer = setTimeout(triggerIdle, 6000 + Math.random() * 2000);
    };

    timer = setTimeout(triggerIdle, 4000);
    return () => clearTimeout(timer);
  }, [focused, idleScale]);

  const softFill = focused ? color + '22' : 'none';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Large Left Card */}
        <AnimatedG style={{ transform: [{ translateY: card1Y }] }}>
          <Rect x="3" y="3" width="8.5" height="18" rx="2.5" fill={softFill} stroke={color} strokeWidth="1.2" />
        </AnimatedG>

        {/* Top Right Card */}
        <G x={17.25} y={7}>
          <AnimatedG style={{ transform: [{ translateY: card2Y }, { scale: idleScale }] }}>
            <G x={-17.25} y={-7}>
              <Rect x="13.5" y="3" width="7.5" height="8" rx="2" fill={softFill} stroke={color} strokeWidth="1.2" />
            </G>
          </AnimatedG>
        </G>

        {/* Bottom Right Card */}
        <AnimatedG style={{ transform: [{ translateY: card3Y }] }}>
          <Rect x="13.5" y="13" width="7.5" height="8" rx="2" fill={softFill} stroke={color} strokeWidth="1.2" />
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
