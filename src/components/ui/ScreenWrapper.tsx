// FreshWash — ScreenWrapper Component
// SafeArea + StatusBar + themed background wrapper for all screens

import React from 'react';
import { View, StatusBar, StyleSheet, StyleProp, ViewStyle, StatusBarStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

export interface ScreenWrapperProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: StatusBarStyle;
  backgroundColor?: string;
  withPadding?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  edges = ['top'],
  statusBarStyle,
  backgroundColor,
  withPadding = false,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor || theme.colors.background;
  const barStyle = statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop,
          paddingBottom,
        },
        withPadding ? { paddingHorizontal: theme.spacing.base } : null,
        style,
      ]}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={bgColor}
        translucent={false}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default React.memo(ScreenWrapper);
