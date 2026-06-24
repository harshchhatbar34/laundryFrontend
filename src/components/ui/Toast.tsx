// FreshWash — Toast Component
// Animated toast notification that slides down from top

import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const CONFIG = {
  success: {
    icon: 'checkmark-circle' as const,
    // Solid vibrant green — clearly visible on both themes
    lightBg: '#D1FAE5',        // green-100
    lightBorder: '#059669',    // green-600
    lightIcon: '#059669',
    darkBg: '#064E3B',         // green-900 — rich dark green
    darkBorder: '#34D399',     // green-400
    darkIcon: '#34D399',
  },
  error: {
    icon: 'alert-circle' as const,
    lightBg: '#FFE4E6',        // rose-100 — clearly pink, not washed out
    lightBorder: '#E11D48',    // rose-600
    lightIcon: '#E11D48',
    darkBg: '#4C0519',         // rose-950
    darkBorder: '#FB7185',     // rose-400
    darkIcon: '#FB7185',
  },
  warning: {
    icon: 'warning' as const,
    lightBg: '#FEF3C7',        // amber-100
    lightBorder: '#D97706',    // amber-600
    lightIcon: '#D97706',
    darkBg: '#451A03',         // amber-950
    darkBorder: '#FCD34D',     // amber-300
    darkIcon: '#FCD34D',
  },
  info: {
    icon: 'information-circle' as const,
    lightBg: '#DBEAFE',        // blue-100
    lightBorder: '#1D4ED8',    // blue-700
    lightIcon: '#1D4ED8',
    darkBg: '#1E3A5F',         // ocean
    darkBorder: '#60A5FA',     // blue-400
    darkIcon: '#60A5FA',
  },
};

const TEXT_LIGHT = '#0F172A';
const TEXT_DARK  = '#F1F5F9';

export interface ToastProps {
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible?: boolean;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', visible, onDismiss }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 90,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => dismiss(), 3500);
      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss?.());
  };

  if (!visible) return null;

  const cfg  = CONFIG[type] || CONFIG.info;
  const bg     = isDark ? cfg.darkBg     : cfg.lightBg;
  const border = isDark ? cfg.darkBorder : cfg.lightBorder;
  const icon   = isDark ? cfg.darkIcon   : cfg.lightIcon;
  const text   = isDark ? TEXT_DARK      : TEXT_LIGHT;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          backgroundColor: bg,
          borderColor: border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: border }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: border + '22' }]}>
        <Ionicons name={cfg.icon} size={20} color={icon} />
      </View>

      {/* Message */}
      <Text
        style={[theme.typography.body, styles.message, { color: text }]}
        numberOfLines={2}
      >
        {message}
      </Text>

      {/* Dismiss */}
      <TouchableOpacity onPress={dismiss} hitSlop={theme.hitSlop} style={styles.closeBtn}>
        <Ionicons name="close" size={16} color={text + '99'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 9999,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginVertical: 12,
  },
  message: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    marginVertical: 14,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
});

export default React.memo(Toast);
