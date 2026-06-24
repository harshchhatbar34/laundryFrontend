// FreshWash — Header Component
// Custom gradient header with back button, title, and optional actions

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  transparent?: boolean;
  large?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  rightIcon,
  onRightPress,
  transparent = false,
  large = false,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const headerContent = (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={theme.hitSlop}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={transparent ? theme.colors.textPrimary : '#FFFFFF'}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text
            style={[
              large ? theme.typography.h1 : theme.typography.h3,
              {
                color: transparent ? theme.colors.textPrimary : '#FFFFFF',
                textAlign: 'center',
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                theme.typography.caption,
                {
                  color: transparent
                    ? theme.colors.textSecondary
                    : 'rgba(255,255,255,0.8)',
                  textAlign: 'center',
                  marginTop: 2,
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.rightButton}
            hitSlop={theme.hitSlop}
          >
            <Ionicons
              name={rightIcon}
              size={24}
              color={transparent ? theme.colors.textPrimary : '#FFFFFF'}
            />
            {rightAction}
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View style={{ backgroundColor: theme.colors.background }}>
        {headerContent}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={(isDark ? [theme.colors.surface, theme.colors.surfaceElevated] : theme.gradients.ocean) as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {headerContent}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(Header);
