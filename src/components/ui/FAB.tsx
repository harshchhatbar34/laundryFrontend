// FreshWash — FAB (Floating Action Button) Component
// Replaces 4 inline FAB patterns across BranchListScreen, HelperManagementScreen,
// ServiceManagementScreen, and AddressListScreen.

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

const FAB: React.FC<FABProps> = ({
  onPress,
  icon = 'add',
  color,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bgColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: bgColor, bottom: 28 + insets.bottom }, style]}
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
    >
      <Ionicons name={icon} size={28} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default React.memo(FAB);
