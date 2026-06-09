import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * ThemedInput
 * Props: label, value, onChangeText, placeholder, error, secureTextEntry,
 *        keyboardType, multiline, numberOfLines, rightIcon, leftIcon, ...rest
 */
const ThemedInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  rightIcon,
  leftIcon,
  style,
  inputStyle,
  ...rest
}) => {
  const { theme } = useTheme();
  const { colors, radius, spacing, typography, shadow } = theme;
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[typography.label, { color: error ? colors.error : colors.textSecondary, marginBottom: 8 }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.inputBg,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? colors.error : focused ? colors.primary : colors.border,
            ...(focused && !error ? shadow.sm : {}),
          },
        ]}
      >
        {leftIcon && <View style={{ paddingLeft: spacing.md }}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            typography.body,
            {
              color: colors.text,
              backgroundColor: 'transparent',
              outlineStyle: 'none',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              minHeight: multiline ? numberOfLines * 24 + 20 : 54,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPass(!showPass)}
            style={{ paddingRight: spacing.md }}
          >
            <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && <View style={{ paddingRight: spacing.md }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[typography.caption, { color: colors.error, marginTop: 4, marginLeft: 4 }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  input: { flex: 1 },
});

export default ThemedInput;
