import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../store/uiSlice';
import { useTheme } from '../theme/ThemeProvider';

export default function GlobalUI() {
  const { loadingCount, toast } = useSelector((s) => s.ui);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { colors, typography, radius, shadow } = theme;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          dispatch(hideToast());
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, fadeAnim, dispatch]);

  return (
    <>
      {loadingCount > 0 && (
        <View style={styles.loaderOverlay}>
          <View style={[styles.loaderBox, { backgroundColor: colors.surface, borderRadius: radius.lg }, shadow.lg]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.body, { color: colors.text, marginTop: 12 }]}>Loading...</Text>
          </View>
        </View>
      )}

      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: toast.type === 'error' ? colors.error : colors.primary,
              borderRadius: radius.md,
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }]
            },
            shadow.md
          ]}
        >
          <Text style={[typography.body, { color: '#FFFFFF', textAlign: 'center' }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  loaderBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 16,
    zIndex: 10000,
    elevation: 10000,
  },
});
