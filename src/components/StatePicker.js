import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function StatePicker({ value, onSelect, error }) {
  const { theme } = useTheme();
  const { colors, typography, radius, spacing } = theme;
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typography.label, { color: colors.text, marginBottom: spacing.xs }]}>State</Text>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          { 
            backgroundColor: colors.inputBg, 
            borderColor: error ? colors.error : colors.border,
            borderRadius: radius.md 
          }
        ]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.placeholder }]}>
          {value || 'Select a state'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 4 }]}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.text }]}>Select State</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: spacing.sm }}>
                <Text style={[typography.label, { color: colors.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[
                styles.searchInput,
                typography.body,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.md, marginBottom: spacing.md }
              ]}
              placeholder="Search state..."
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                    setSearch('');
                  }}
                >
                  <Text style={[typography.body, { color: item === value ? colors.primary : colors.text, fontWeight: item === value ? '600' : '400' }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  stateItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  }
});
