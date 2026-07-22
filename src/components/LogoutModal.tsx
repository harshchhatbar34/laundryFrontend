import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onConfirm, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 180, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0,   duration: 180, useNativeDriver: true }),
      ]).start(() => {
        slideAnim.setValue(300);
        iconScale.setValue(0.8);
      });
    }
  }, [visible]);

  // Theme-aware gradient: use primary gradient from theme
  const gradientColors = theme.gradients.primary as [string, string, ...string[]];

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ translateY: slideAnim }],
                  maxHeight: SCREEN_HEIGHT * 0.35,
                },
              ]}
            >
              {/* Close button */}
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={onCancel}
              >
                <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Icon + Title row */}
              <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
                <LinearGradient
                  colors={[theme.colors.error + 'CC', theme.colors.error]}
                  style={styles.iconCircle}
                >
                  <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>

              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                Log out of your account?
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                You'll need to sign in again to continue.
              </Text>

              {/* Buttons row */}
              <View style={styles.btnRow}>
                {/* Cancel */}
                <TouchableOpacity
                  onPress={onCancel}
                  style={[styles.cancelBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cancelText, { color: theme.colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                {/* Log Out — theme primary gradient */}
                <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={styles.confirmBtnWrap}>
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmBtn}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmText}>Log Out</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtnWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LogoutModal;
