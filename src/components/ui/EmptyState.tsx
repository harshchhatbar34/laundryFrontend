// FreshWash — Premium EmptyState Component
// Expressive illustration container with ambient floating motion & gold accent

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Button from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'basket-outline',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ambient floating animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.primaryBg,
            borderColor: theme.colors.borderGold,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Ionicons name={icon} size={44} color={theme.colors.primary} />
        <View style={styles.sparkleBadge}>
          <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
        </View>
      </Animated.View>

      <Text style={[theme.typography.h3, styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[theme.typography.body, styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="gold"
          size="medium"
          fullWidth={false}
          style={{ marginTop: 24, paddingHorizontal: 28 }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sparkleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default React.memo(EmptyState);
