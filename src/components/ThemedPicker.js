import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function ThemedPicker({ label, value, options, onSelect, placeholder = 'Select an option' }) {
  const [visible, setVisible] = React.useState(false);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[
          styles.picker,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.textMuted }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={{ color: colors.textSecondary }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.md,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: value === item.value ? colors.primary + '10' : 'transparent',
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      { color: value === item.value ? colors.primary : colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '60%',
  },
  option: {
    padding: 15,
    marginBottom: 5,
  },
});
