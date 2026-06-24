// FreshWash — Divider Component
import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  spacing?: number;
  color?: string;
}

const Divider: React.FC<DividerProps> = ({ style, spacing = 16, color }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: color || theme.colors.divider,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
};

export default React.memo(Divider);
