// FreshWash — GlobalOverlay Component
// Full-screen loading overlay with BubbleLoader + Toast notifications

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import { hideToast } from '../store/slices/uiSlice';
import Toast from './ui/Toast';
import FreshSpinLoader from './ui/FreshSpinLoader';
import { RootState } from '../store';

const GlobalOverlay = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { isLoading, toast } = useSelector((state: RootState) => state.ui);

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.loaderCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: 20,
                borderColor: theme.colors.border + '60',
                borderWidth: 1,
              },
              theme.shadows.xl as any,
            ]}
          >
            <FreshSpinLoader
              size="medium"
              message="Freshening Up"
              subtitle="Gentle care in motion"
              showDots={true}
            />
          </View>
        </View>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => dispatch(hideToast())}
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  loaderCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 136,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(GlobalOverlay);
