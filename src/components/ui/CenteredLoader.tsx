// FreshWash / LaundroFlow — CenteredLoader Component
// Uses the new FreshSpinLoader for seamless, premium animated loading

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import FreshSpinLoader from './FreshSpinLoader';

interface CenteredLoaderProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Override spinner size. Defaults to 'large'. */
  size?: 'small' | 'large';
  /** If true, takes up the full flex:1 container. Defaults to true. */
  fullScreen?: boolean;
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message = 'Loading...',
  size = 'large',
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
        size={size === 'large' ? 'large' : 'small'}
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
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
});

export default React.memo(CenteredLoader);
