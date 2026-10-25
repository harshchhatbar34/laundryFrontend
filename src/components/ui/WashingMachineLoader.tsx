// FreshWash — Animated Washing Machine & Sparkles Loader
// Premium replacement for generic activity spinners

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface WashingMachineLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const WashingMachineLoader: React.FC<WashingMachineLoaderProps> = ({
  message = 'Refreshing...',
  size = 'medium',
}) => {
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Continuous drum spin
    const spinLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous soft pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [rotateAnim, pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconSizes = {
    small: 28,
    medium: 44,
    large: 64,
  };

  const containerSizes = {
    small: 52,
    medium: 80,
    large: 108,
  };

  const currentIconSize = iconSizes[size] || iconSizes.medium;
  const currentBoxSize = containerSizes[size] || containerSizes.medium;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconBox,
          {
            width: currentBoxSize,
            height: currentBoxSize,
            borderRadius: currentBoxSize / 2,
            backgroundColor: theme.colors.primaryBg,
            borderColor: theme.colors.borderGold,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="sync-outline" size={currentIconSize} color={theme.colors.primary} />
        </Animated.View>
        <View style={styles.sparkleBadge}>
          <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
        </View>
      </Animated.View>

      {message ? (
        <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginTop: 14 }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});

export default React.memo(WashingMachineLoader);
