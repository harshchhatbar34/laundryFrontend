// FreshWash — Input Component
// Floating-label text input with animated label, error state, and icon support

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  TextInputProps,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface InputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
  textContentType?: any;
  autoComplete?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  style,
  inputStyle,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  textContentType,
  autoComplete,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  const hasValue = !!value;
  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, labelAnim]);

  const bodyStyle = (() => {
    if (secureTextEntry && !showPassword) {
      const { fontFamily, ...rest } = theme.typography.body;
      return rest;
    }
    return theme.typography.body;
  })();

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocusProp?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlurProp?.(e);
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const borderColor = error
    ? theme.colors.error
    : isFocused
    ? theme.colors.inputFocus
    : theme.colors.inputBorder;

  const bgColor = isFocused
    ? theme.colors.surface
    : theme.colors.inputBg;

  return (
    <View style={[styles.wrapper, style]} collapsable={false}>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          collapsable={false}
          style={[
            styles.container,
            {
              borderColor,
              backgroundColor: bgColor,
              borderRadius: theme.radius.md,
              borderWidth: 1.5,
            },
            error ? { borderColor: theme.colors.error } : null,
            multiline ? { minHeight: numberOfLines * 22 + 32 } : null,
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? theme.colors.primary : theme.colors.placeholder}
              style={styles.leftIcon}
            />
          )}

          <View style={styles.inputContainer}>
            {label && (
              <Animated.Text
                pointerEvents="none"
                style={[
                  styles.label,
                  {
                    top: labelTop,
                    fontSize: labelFontSize as any,
                    color: error
                      ? theme.colors.error
                      : isFocused
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                    backgroundColor: bgColor,
                  },
                ]}
              >
                {label}
              </Animated.Text>
            )}

            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={isFocused ? placeholder : ''}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              multiline={multiline}
              numberOfLines={numberOfLines}
              maxLength={maxLength}
              editable={editable}
              onFocus={handleFocus}
              onBlur={handleBlur}
              textContentType={textContentType}
              autoComplete={autoComplete}
              style={[
                styles.input,
                bodyStyle,
                {
                  color: theme.colors.textPrimary,
                },
                multiline ? { textAlignVertical: 'top' } : null,
                inputStyle,
              ]}
            />
          </View>

          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.rightIcon}
              hitSlop={theme.hitSlop}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !secureTextEntry && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={theme.hitSlop}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>

      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={[theme.typography.caption, styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  leftIcon: {
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  rightIcon: {
    marginLeft: 10,
    padding: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    marginLeft: 4,
  },
});

export default React.memo(Input);
