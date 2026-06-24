// FreshWash — Avatar Component
// Circular avatar with gradient fallback showing initials

import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { getInitials } from '../../utils/helpers';

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 44,
  style,
}) => {
  const { theme } = useTheme();
  const initials = getInitials(name);
  const fontSize = size * 0.4;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          } as any,
          style,
        ]}
      />
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.primary as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {initials}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default React.memo(Avatar);
