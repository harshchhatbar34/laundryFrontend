// SlideUpModal — Animated bottom sheet modal
// Uses React Native's built-in Animated API

import React, { useEffect, useRef, useCallback, memo, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SlideUpModalProps {
  visible?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  height?: number;
  dragZoneHeight?: number;
}

const SlideUpModal = memo<SlideUpModalProps>(({
  visible = false,
  onClose,
  children,
  height = 400,
  dragZoneHeight = 180,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [shouldRender, setShouldRender] = useState(visible);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          if (onClose) {
            onClose();
          } else {
            // Spring back if no onClose handler
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Snap back to top
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 65,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Reset animations to start state
      translateY.setValue(height);
      backdropOpacity.setValue(0);

      animationRef.current = Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
    } else {
      // Animate out
      animationRef.current = Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 250,
          easing: Easing.bezier(0.4, 0, 1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [visible, translateY, backdropOpacity, height]);

  const handleBackdropPress = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Use internal visible state that includes close animation time
  // Modal stays mounted during close animation
  if (!shouldRender) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={shouldRender}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity, backgroundColor: theme.colors.overlay },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height,
              maxHeight: SCREEN_HEIGHT * 0.9,
              transform: [{ translateY }],
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          {/* Handle bar with drag gesture responder */}
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>

          {/* Absolute positioned Drag Zone over the top of the sheet */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                height: dragZoneHeight,
                backgroundColor: 'transparent',
              },
            ]}
            pointerEvents="box-none"
          >
            <View
              {...panResponder.panHandlers}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

SlideUpModal.displayName = 'SlideUpModal';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: palette.ocean,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
});

export default SlideUpModal;
