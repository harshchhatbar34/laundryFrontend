// FreshWash / LaundroFlow — CenteredLoader Component
// Uses the new FreshSpinLoader for seamless, premium animated loading

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import FreshSpinLoader from './FreshSpinLoader';

interface CenteredLoaderProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Override spinner size. Defaults to 'medium'. */
  size?: 'small' | 'medium' | 'large';
  /** If true, takes up the full flex:1 container. Defaults to true. */
  fullScreen?: boolean;
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        fullScreen && { backgroundColor: theme.colors.background },
      ]}
    >
      <FreshSpinLoader
        size={size}
        message={message}
        showDots={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  fullScreen: {
    flex: 1,
  },
});

export default React.memo(CenteredLoader);
