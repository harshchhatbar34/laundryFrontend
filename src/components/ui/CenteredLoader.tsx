// FreshWash — CenteredLoader Component
// Displays a premium, thematic animated ripple loader (breathing water orb + concentric pulsing ripples)

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface CenteredLoaderProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Override spinner size. Defaults to 'large'. */
  size?: 'small' | 'large';
  /** If true, takes up the full flex:1 container. Defaults to true. */
  fullScreen?: boolean;
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message,
  size = 'large',
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  // Pulse animations for ripple effects
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  
  // Breathe/scale animation for center icon
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Ripple animations using standard timeouts for initial delay instead of loop sequence delays
    const startRipple = (val: Animated.Value, delay: number) => {
      const animation = Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );

      const timeout = setTimeout(() => {
        val.setValue(0);
        animation.start();
      }, delay);

      return {
        stop: () => {
          clearTimeout(timeout);
          animation.stop();
        }
      };
    };

    // 2. Breathe animation
    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const r1 = startRipple(ripple1, 0);
    const r2 = startRipple(ripple2, 1100);
    breatheAnim.start();

    return () => {
      r1.stop();
      r2.stop();
      breatheAnim.stop();
    };
  }, [ripple1, ripple2, breathe]);

  // Interpolations
  const scale1 = ripple1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const opacity1 = ripple1.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.15, 0],
  });

  const scale2 = ripple2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const opacity2 = ripple2.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.15, 0],
  });

  const breatheScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.06],
  });

  const isSmall = size === 'small';
  const centerSize = isSmall ? 40 : 64;
  const iconSize = isSmall ? 18 : 26;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: theme.colors.background }]}>
      <View style={{ width: centerSize * 2.2, height: centerSize * 2.2, alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Pulsing Ripple 1 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
              backgroundColor: theme.colors.primary,
              transform: [{ scale: scale1 }],
              opacity: opacity1,
            },
          ]}
        />

        {/* Pulsing Ripple 2 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
              backgroundColor: theme.colors.primary,
              transform: [{ scale: scale2 }],
              opacity: opacity2,
            },
          ]}
        />

        {/* Floating Center Orb with Laundry Droplet */}
        <Animated.View
          style={[
            styles.centerOrb,
            {
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
              backgroundColor: theme.colors.primary,
              transform: [{ scale: breatheScale }],
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="water" size={iconSize} color="#FFF" />
        </Animated.View>
      </View>

      {message ? (
        <Text style={[theme.typography.labelSmall, { color: theme.colors.textSecondary, marginTop: 16 }]}>
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
  fullScreen: {
    flex: 1,
  },
  ripple: {
    position: 'absolute',
  },
  centerOrb: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default React.memo(CenteredLoader);
