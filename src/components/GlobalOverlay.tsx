// FreshWash — GlobalOverlay Component
// Full-screen loading overlay with BubbleLoader + Toast notifications

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../store/slices/uiSlice';
import Toast from './ui/Toast';
import FreshSpinLoader from './ui/FreshSpinLoader';
import { RootState } from '../store';

const GlobalOverlay = () => {
  const dispatch = useDispatch();
  const { isLoading, toast } = useSelector((state: RootState) => state.ui);

  return (
    <>
      {/* Loading Overlay — Transparent backdrop, borderless, zero text */}
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <FreshSpinLoader
            size="large"
            message=""
            subtitle=""
            showDots={false}
          />
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
    backgroundColor: 'transparent',
    zIndex: 9998,
  },
});

export default React.memo(GlobalOverlay);
