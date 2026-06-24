// FreshWash — SearchBar Component
// Premium animated search bar with glassmorphic styling for mobile

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Optional: shows "N results" badge */
  resultCount?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  resultCount,
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const clearAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    Animated.spring(clearAnim, {
      toValue: value.length > 0 ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  // Animated border color
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      theme.colors.primary + '60',
    ],
  });

  // Animated background
  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.95)',
    ],
  });

  // Animated shadow opacity
  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  // Animated elevation
  const elevation = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  // Clear button scale
  const clearScale = clearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: borderColor as any,
          backgroundColor: backgroundColor as any,
          borderRadius: 16,
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: shadowOpacity as any,
                shadowRadius: 12,
              }
            : {
                elevation: elevation as any,
              }),
        },
      ]}
    >
      {/* Search Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isFocused
              ? theme.colors.primary + '15'
              : 'transparent',
          },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? theme.colors.primary : theme.colors.textMuted}
        />
      </Animated.View>

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={theme.colors.primary}
        returnKeyType="search"
        autoCorrect={false}
        style={[
          styles.input,
          theme.typography.body,
          {
            color: theme.colors.textPrimary,
          },
        ]}
      />

      {/* Result count badge (optional) */}
      {resultCount !== undefined && value.length > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.primary + '15',
            },
          ]}
        >
          <Ionicons
            name="people"
            size={12}
            color={theme.colors.primary}
            style={{ marginRight: 3 }}
          />
          <Animated.Text
            style={[
              theme.typography.caption,
              {
                color: theme.colors.primary,
                fontWeight: '700',
                fontSize: 11,
              },
            ]}
          >
            {resultCount}
          </Animated.Text>
        </View>
      )}

      {/* Clear button */}
      <Animated.View
        style={{
          transform: [{ scale: clearScale }],
          opacity: clearAnim,
        }}
      >
        <TouchableOpacity
          onPress={handleClear}
          style={[
            styles.clearBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(0,0,0,0.06)',
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Ionicons
            name="close"
            size={14}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
    minHeight: 48,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 4,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});

export default React.memo(SearchBar);
