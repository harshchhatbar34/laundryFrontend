// WashingMachineLoader — Custom themed laundry loader
// Renders a washing machine body with an infinitely spinning drum and tumbling elements

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface WashingMachineLoaderProps {
  size?: number;
  color?: string;
}

const WashingMachineLoader = memo<WashingMachineLoaderProps>(({ size = 80, color }) => {
  const { theme } = useTheme();
  const activeColor = color || theme.colors.primary;

  // Animation values
  const spinAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Infinite Spin for the drum
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Tumbling pulse for internal bubbles/clothes
    const bubbleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    bubbleLoop.start();

    return () => {
      spinLoop.stop();
      bubbleLoop.stop();
    };
  }, [spinAnim, bubbleAnim]);

  // Interpolate rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolate bubble positions (tumbling effect)
  const bubbleY1 = bubbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [size * 0.1, -size * 0.15, size * 0.05],
  });
  const bubbleX1 = bubbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.1, size * 0.08, -size * 0.05],
  });

  const bubbleY2 = bubbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.08, size * 0.12, -size * 0.1],
  });
  const bubbleX2 = bubbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [size * 0.08, -size * 0.1, size * 0.05],
  });

  const drumSize = size * 0.65;
  const glassSize = drumSize * 0.85;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Washing Machine Outer Frame */}
      <View style={[styles.machineBody, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceVariant, borderRadius: size * 0.15 }]}>
        {/* Top Control Panel Bar */}
        <View style={[styles.controlPanel, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.controlKnob, { backgroundColor: theme.colors.textMuted }]} />
          <View style={styles.controlLights}>
            <View style={[styles.light, { backgroundColor: theme.colors.success }]} />
            <View style={[styles.light, { backgroundColor: theme.colors.warning }]} />
          </View>
        </View>

        {/* Circular Door Frame */}
        <View style={[styles.doorFrame, { width: drumSize, height: drumSize, borderRadius: drumSize / 2, borderColor: theme.colors.border }]}>
          {/* Transparent Glass Area */}
          <View style={[styles.glassWindow, { width: glassSize, height: glassSize, borderRadius: glassSize / 2, backgroundColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
            
            {/* Spinning Ribs / Waves inside the drum */}
            <Animated.View style={[styles.drumInner, { width: glassSize, height: glassSize, transform: [{ rotate: spin }] }]}>
              {/* Spinning Fin 1 */}
              <View style={[styles.drumFin, { width: 4, height: glassSize * 0.25, backgroundColor: theme.colors.textMuted, top: 4 }]} />
              {/* Spinning Fin 2 */}
              <View style={[styles.drumFin, { width: 4, height: glassSize * 0.25, backgroundColor: theme.colors.textMuted, bottom: 4 }]} />
            </Animated.View>

            {/* Tumbling Bubbles / Items (don't rotate strictly with drum, they tumble/float) */}
            <Animated.View style={[styles.bubble, { width: size * 0.18, height: size * 0.18, borderRadius: (size * 0.18) / 2, backgroundColor: activeColor, transform: [{ translateY: bubbleY1 }, { translateX: bubbleX1 }] }]}>
              <View style={styles.bubbleShine} />
            </Animated.View>
            <Animated.View style={[styles.bubble, { width: size * 0.12, height: size * 0.12, borderRadius: (size * 0.12) / 2, backgroundColor: theme.colors.secondary, transform: [{ translateY: bubbleY2 }, { translateX: bubbleX2 }], opacity: 0.85 }]}>
              <View style={styles.bubbleShine} />
            </Animated.View>

          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineBody: {
    width: '100%',
    height: '100%',
    borderWidth: 2.5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '8%',
  },
  controlPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
  },
  controlKnob: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controlLights: {
    flexDirection: 'row',
  },
  light: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 3,
  },
  doorFrame: {
    borderWidth: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  glassWindow: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  drumInner: {
    position: 'absolute',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drumFin: {
    borderRadius: 2,
    opacity: 0.4,
  },
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleShine: {
    width: '30%',
    height: '30%',
    borderRadius: 10,
    backgroundColor: '#FFF',
    position: 'absolute',
    top: '15%',
    left: '15%',
    opacity: 0.65,
  },
});

export default WashingMachineLoader;
