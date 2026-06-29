// FreshWash — PincodeDropdown Component
// Dropdown selector for Pincodes based on selected City using the postalpincode.in API

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface PincodeDropdownProps {
  label?: string;
  selectedCity?: string;
  selectedPincode?: string;
  onSelect: (pincode: string) => void;
  error?: string | null;
  placeholder?: string;
}

const PincodeDropdown: React.FC<PincodeDropdownProps> = ({
  label = 'Pincode',
  selectedCity = '',
  selectedPincode = '',
  onSelect,
  error,
  placeholder = 'Select pincode',
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pincodes whenever the selectedCity changes
  useEffect(() => {
    if (!selectedCity.trim()) {
      setPincodes([]);
      return;
    }

    const fetchPincodes = async () => {
      setLoading(true);
      console.log(`[API REQ] GET https://api.postalpincode.in/postoffice/${selectedCity.trim()}`);
      try {
        const response = await fetch(
          `https://api.postalpincode.in/postoffice/${encodeURIComponent(selectedCity.trim())}`
        );
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
          const list = data[0].PostOffice.map((po: any) => po.Pincode || po.PINCode || po.pincode).filter(Boolean);
          // Deduplicate and sort
          const uniqueList = Array.from(new Set(list)) as string[];
          uniqueList.sort((a, b) => a.localeCompare(b));
          setPincodes(uniqueList);
          console.log(`[API RES SUCCESS] GET https://api.postalpincode.in/postoffice/${selectedCity.trim()} 200 - Found ${uniqueList.length} pincodes`);
        } else {
          setPincodes([]);
          console.log(`[API RES SUCCESS] GET https://api.postalpincode.in/postoffice/${selectedCity.trim()} 200 - No pincodes found`);
        }
      } catch (err) {
        console.error('Error fetching pincodes:', err);
        setPincodes([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPincodes();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCity]);

  // Filter pincodes by search query
  const filteredPincodes = useMemo(() => {
    if (!searchQuery.trim()) return pincodes;
    return pincodes.filter((p) =>
      p.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery, pincodes]);

  const handleSelect = (pincode: string) => {
    onSelect(pincode);
    setModalVisible(false);
    setSearchQuery('');
  };

  const isDisabled = !selectedCity.trim();

  const borderColor = error
    ? theme.colors.error
    : modalVisible
    ? theme.colors.inputFocus
    : theme.colors.inputBorder;

  const bgColor = isDisabled
    ? theme.colors.border + '30'
    : modalVisible
    ? theme.colors.surface
    : theme.colors.inputBg;

  // Determine display text and styling
  let displayText = placeholder;
  let isPlaceholderStyle = !selectedPincode;

  if (!selectedCity.trim()) {
    displayText = 'Select city first';
    isPlaceholderStyle = true;
  } else if (loading && !selectedPincode) {
    displayText = 'Loading pincodes...';
    isPlaceholderStyle = true;
  } else if (selectedPincode) {
    displayText = selectedPincode;
    isPlaceholderStyle = false;
  } else if (pincodes.length === 0 && !loading) {
    displayText = 'No pincodes found for city';
    isPlaceholderStyle = true;
  }

  return (
    <View style={styles.wrapper}>
      {/* Selector Button */}
      <View>
        {label && (
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {
                color: error
                  ? theme.colors.error
                  : isDisabled
                  ? theme.colors.textMuted
                  : modalVisible
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            {label}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isDisabled}
          onPress={() => setModalVisible(true)}
          style={[
            styles.selector,
            {
              borderColor: isDisabled ? theme.colors.border : borderColor,
              backgroundColor: bgColor,
              borderRadius: theme.radius.md,
              borderWidth: 1.5,
              opacity: isDisabled ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={isDisabled ? theme.colors.textMuted : modalVisible ? theme.colors.primary : theme.colors.placeholder}
            style={styles.leftIcon}
          />
          
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 10 }} />
          ) : null}

          <Text
            style={[
              theme.typography.body,
              styles.selectedValue,
              {
                color: isPlaceholderStyle
                  ? theme.colors.placeholder
                  : theme.colors.textPrimary,
              },
            ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Ionicons
            name={modalVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.placeholder}
            style={styles.rightIcon}
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text
            style={[
              theme.typography.caption,
              styles.errorText,
              { color: theme.colors.error },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Pincodes Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
          
          {/* Modal Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              hitSlop={theme.hitSlop}
              style={styles.closeButton}
            >
              <Ionicons name="close-outline" size={26} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
              Select Pincode ({selectedCity})
            </Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={theme.colors.placeholder} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search pincode..."
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.searchInput, theme.typography.body, { color: theme.colors.textPrimary }]}
                keyboardType="numeric"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={theme.hitSlop}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color={theme.colors.placeholder} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Pincodes List */}
          <FlatList
            data={filteredPincodes}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item === selectedPincode;
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.row,
                    { borderBottomColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.primaryLight },
                  ]}
                >
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={40} color={theme.colors.placeholder} />
                <Text
                  style={[
                    theme.typography.body,
                    { color: theme.colors.textSecondary, marginTop: 8 },
                  ]}
                >
                  No pincodes match your search
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    position: 'absolute',
    left: 10,
    top: -8,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
  },
  leftIcon: {
    marginRight: 10,
  },
  selectedValue: {
    flex: 1,
  },
  rightIcon: {
    marginLeft: 10,
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
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchWrapper: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});

export default React.memo(PincodeDropdown);
