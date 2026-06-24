// RippleButton — Material-style ripple effect on touch
// Uses React Native's built-in Animated API

import React, { useRef, useCallback, useState, memo } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { palette } from '../theme/colors';

export interface RippleButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  rippleColor?: string;
  disabled?: boolean;
}

const RippleButton = memo<RippleButtonProps>(({
  onPress,
  style,
  children,
  rippleColor = palette.azure,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;
  const [ripple, setRipple] = useState<{ x: number; y: number; size: number } | null>(null);
  const containerRef = useRef<View>(null);

  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    // Measure container to calculate max ripple radius
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height) => {
        // Ripple needs to cover the full container from the touch point
        const maxDist = Math.sqrt(
          Math.max(locationX, width - locationX) ** 2 +
          Math.max(locationY, height - locationY) ** 2
        );
        const rippleSize = maxDist * 2;

        setRipple({
          x: locationX - rippleSize / 2,
          y: locationY - rippleSize / 2,
          size: rippleSize,
        });

        scale.setValue(0);
        opacity.setValue(0.35);

        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.25, 0.8, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setRipple(null);
        });
      });
    }
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    if (onPress && !disabled) {
      onPress();
    }
  }, [onPress, disabled]);

  return (
    <Pressable
      ref={containerRef as any}
      onPressIn={handlePressIn}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style] as any}
    >
      {children}
      {ripple && (
        <View style={styles.rippleContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.ripple,
              {
                width: ripple.size,
                height: ripple.size,
                borderRadius: ripple.size / 2,
                backgroundColor: rippleColor,
                left: ripple.x,
                top: ripple.y,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
});

RippleButton.displayName = 'RippleButton';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
  },
});

export default RippleButton;
