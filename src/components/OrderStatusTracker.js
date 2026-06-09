import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUS_STEPS = [
  { key: 'pending', label: 'Placed', icon: 'clipboard-text-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'check-circle-outline' },
  { key: 'pickup', label: 'Pickup', icon: 'car-pickup' },
  { key: 'received', label: 'Received', icon: 'package-variant-closed' },
  { key: 'processing', label: 'Washing', icon: 'washing-machine' },
  { key: 'ready', label: 'Ready', icon: 'hanger' },
  { key: 'out_delivery', label: 'Delivery', icon: 'truck-delivery-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'party-popper' },
];

const OrderStatusTracker = ({ currentStatus }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  if (currentStatus === 'cancelled') {
    return (
      <View style={[styles.cancelledBox, { backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md }]}>
        <Text style={{ fontSize: 24 }}>❌</Text>
        <Text style={[typography.body, { color: colors.error, marginTop: 4 }]}>Order Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <View style={styles.container}>
      {STATUS_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Connector line */}
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isDone
                      ? colors.success
                      : isCurrent
                      ? colors.primary
                      : colors.border,
                    borderColor: isCurrent ? colors.primary : 'transparent',
                    borderWidth: isCurrent ? 2 : 0,
                    width: isCurrent ? 20 : 14,
                    height: isCurrent ? 20 : 14,
                  },
                ]}
              />
              {index < STATUS_STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isDone ? colors.success : colors.border },
                  ]}
                />
              )}
            </View>

            {/* Label */}
            <View style={[styles.labelCol, { paddingBottom: spacing.md }]}>
              <MaterialCommunityIcons 
                name={step.icon} 
                size={22} 
                color={isCurrent ? colors.primary : isDone ? colors.success : colors.textMuted} 
              />
              <Text
                style={[
                  typography.body,
                  {
                    color: isPending ? colors.textMuted : colors.text,
                    fontWeight: isCurrent ? '700' : '400',
                    marginLeft: 8,
                  },
                ]}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <View
                  style={{
                    backgroundColor: colors.primary + '20',
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                    Now
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  cancelledBox: { alignItems: 'center', padding: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  leftCol: { alignItems: 'center', width: 28 },
  dot: { borderRadius: 50 },
  line: { width: 2, flex: 1, minHeight: 24 },
  labelCol: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingLeft: 8 },
});

export default OrderStatusTracker;
