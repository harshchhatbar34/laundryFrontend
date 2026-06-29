// FreshWash — CityDropdown Component
// Dropdown selector for Cities based on selected Indian State using country-state-city package

import React, { useState, useMemo } from 'react';
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
import { State, City } from 'country-state-city';

interface CityDropdownProps {
  label?: string;
  selectedState?: string;
  selectedCity?: string;
  onSelect: (city: string) => void;
  error?: string | null;
  placeholder?: string;
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  label = 'City',
  selectedState = '',
  selectedCity = '',
  onSelect,
  error,
  placeholder = 'Select your city',
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Get cities based on selectedState
  const citiesList = useMemo(() => {
    if (!selectedState.trim()) return [];
    
    // Find matching state in India
    const states = State.getStatesOfCountry('IN');
    const matchedState = states.find(
      (s) => s.name.toLowerCase() === selectedState.toLowerCase().trim()
    );

    if (!matchedState) return [];

    // Get cities
    const cities = City.getCitiesOfState('IN', matchedState.isoCode);
    return cities.map((c) => c.name);
  }, [selectedState]);

  // 2. Filter cities by search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return citiesList;
    return citiesList.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery, citiesList]);

  const handleSelect = (city: string) => {
    onSelect(city);
    setModalVisible(false);
    setSearchQuery('');
  };

  const isDisabled = !selectedState.trim() || citiesList.length === 0;

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
            name="business-outline"
            size={20}
            color={isDisabled ? theme.colors.textMuted : modalVisible ? theme.colors.primary : theme.colors.placeholder}
            style={styles.leftIcon}
          />
          <Text
            style={[
              theme.typography.body,
              styles.selectedValue,
              {
                color: selectedCity
                  ? theme.colors.textPrimary
                  : theme.colors.placeholder,
              },
            ]}
            numberOfLines={1}
          >
            {isDisabled
              ? selectedState.trim()
                ? 'No cities found for state'
                : 'Select state first'
              : selectedCity || placeholder}
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

      {/* Cities Picker Modal */}
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
              Select City ({selectedState})
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
                placeholder="Search city..."
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.searchInput, theme.typography.body, { color: theme.colors.textPrimary }]}
                autoCapitalize="words"
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

          {/* Cities List */}
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item === selectedCity;
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.cityRow,
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
                  No cities match your search
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
  cityRow: {
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

export default React.memo(CityDropdown);
