import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedTabBarIconProps {
  focused: boolean;
  color: string;
  activeColor: string;
  children: React.ReactNode;
}

export const AnimatedTabBarIcon: React.FC<AnimatedTabBarIconProps> = ({
  focused,
  activeColor,
  children,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.14 : 1)).current;
  const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.14 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -2 : 0,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [{ scale: scaleAnim }, { translateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pillBackground,
          {
            backgroundColor: activeColor + '18',
            opacity: opacityAnim,
          },
        ]}
      />
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pillBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
});
