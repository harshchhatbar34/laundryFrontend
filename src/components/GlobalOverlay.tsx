// FreshWash — GlobalOverlay Component
// Full-screen loading overlay with BubbleLoader + Toast notifications

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import { hideToast } from '../store/slices/uiSlice';
import Toast from './ui/Toast';
import BubbleLoader from '../animations/BubbleLoader';
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
                borderRadius: theme.radius.xl,
              },
              theme.shadows.xl as any,
            ]}
          >
            <BubbleLoader size="medium" />
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  loaderCard: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(GlobalOverlay);
