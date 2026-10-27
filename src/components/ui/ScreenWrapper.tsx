// FreshWash — ScreenWrapper Component
// SafeArea + StatusBar + themed background wrapper for all screens

import React from 'react';
import { View, StatusBar, StyleSheet, StyleProp, ViewStyle, StatusBarStyle, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

export interface ScreenWrapperProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: StatusBarStyle;
  backgroundColor?: string;
  withPadding?: boolean;
  dismissKeyboardOnTap?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  edges = ['top'],
  statusBarStyle,
  backgroundColor,
  withPadding = false,
  dismissKeyboardOnTap = true,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor || theme.colors.background;
  const barStyle = statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  const content = (
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
        {...({ backgroundColor: bgColor, translucent: false } as any)}
      />
      {children}
    </View>
  );

  if (dismissKeyboardOnTap) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default React.memo(ScreenWrapper);
