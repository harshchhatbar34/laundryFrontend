import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const STATUS_STEPS = [
  { key: 'pending', label: 'Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'pickup', label: 'Pickup', icon: '🚗' },
  { key: 'received', label: 'Received', icon: '📦' },
  { key: 'processing', label: 'Washing', icon: '🫧' },
  { key: 'ready', label: 'Ready', icon: '✨' },
  { key: 'out_delivery', label: 'Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
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
              <Text style={{ fontSize: 16 }}>{step.icon}</Text>
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
