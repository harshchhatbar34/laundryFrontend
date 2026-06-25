import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Divider from '../../components/ui/Divider';
import UpiQrCode from '../../components/ui/UpiQrCode';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getOrderDetail } from '../../api/orders';
import { respondToOrder, getServices as getOwnerServices, getOwnerProfile } from '../../api/owner';
import { acceptOrder, updateOrderStatus, failDelivery, updateBill } from '../../api/helper';
import { formatPrice, formatDate, getStatusLabel, getStatusColorKey } from '../../utils/helpers';
import { ORDER_STATUS_FLOW } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerOrderStackParamList } from '../../navigation/OwnerTabs';
import { RootState } from '../../store';

type Props = NativeStackScreenProps<OwnerOrderStackParamList, 'OwnerOrderDetail'>;

export default function OwnerOrderDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [verifiedItems, setVerifiedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [ownerUpiId, setOwnerUpiId] = useState('');
  const [ownerLaundryName, setOwnerLaundryName] = useState('');

  // Edit Order Items State
  const [isEditing, setIsEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<{ services: any[]; materials: any[]; items: any[] }>({
    services: [],
    materials: [],
    items: [],
  });
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Add New Item selection state
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedQty, setSelectedQty] = useState(1);

  // Option Picker Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState<any[]>([]);
  const [onSelectOption, setOnSelectOption] = useState<(opt: any) => void>(() => () => {});

  // Reject Order Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Fetch owner's UPI ID on mount
  useEffect(() => {
    getOwnerProfile()
      .then((res) => {
        const p = res?.data;
        if (p?.upiId) setOwnerUpiId(p.upiId);
        if (p?.laundryName) setOwnerLaundryName(p.laundryName);
      })
      .catch(() => {});
  }, []);

  const fetchCatalog = async () => {
    if (catalog.services.length > 0) return;
    setCatalogLoading(true);
    try {
      const res = await getOwnerServices();
      if (res?.data) {
        setCatalog(res.data);
      }
    } catch (e) {
      console.log(e);
      dispatch(showToast({ type: 'error', message: 'Failed to load service catalog' }));
    } finally {
      setCatalogLoading(false);
    }
  };

  const startEditing = async () => {
    setDraftItems(
      (order.items || []).map((it: any) => ({
        service: it.service?._id || it.service,
        serviceName: it.serviceName || it.service?.name || 'Service',
        material: it.material?._id || it.material,
        materialName: it.materialName || it.material?.name || 'Material',
        item: it.item?._id || it.item,
        itemName: it.itemName || it.item?.name || 'Item',
        quantity: it.quantity,
        price: it.price,
      }))
    );
    setIsEditing(true);
    await fetchCatalog();
  };

  const handleDeleteDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateDraftQty = (index: number, delta: number) => {
    setDraftItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
      )
    );
  };

  const openPicker = (title: string, options: any[], onSelect: (opt: any) => void) => {
    setPickerTitle(title);
    setPickerOptions(options);
    setOnSelectOption(() => (opt: any) => {
      onSelect(opt);
      setPickerVisible(false);
    });
    setPickerVisible(true);
  };

  const handleAddDraftItem = () => {
    if (!selectedService || !selectedMaterial || !selectedItem) {
      dispatch(showToast({ type: 'warning', message: 'Please select service, material and item' }));
      return;
    }
    const exists = draftItems.some(
      (it) =>
        it.service === selectedService._id &&
        it.material === selectedMaterial._id &&
        it.item === selectedItem._id
    );
    if (exists) {
      dispatch(showToast({ type: 'warning', message: 'Item already exists in the order' }));
      return;
    }

    const newItem = {
      service: selectedService._id,
      serviceName: selectedService.name,
      material: selectedMaterial._id,
      materialName: selectedMaterial.name,
      item: selectedItem._id,
      itemName: selectedItem.name,
      quantity: selectedQty,
      price: (selectedMaterial.price || 0) + (selectedItem.price || 0),
    };

    setDraftItems((prev) => [...prev, newItem]);
    setSelectedService(null);
    setSelectedMaterial(null);
    setSelectedItem(null);
    setSelectedQty(1);
  };

  const handleSaveEdits = async () => {
    if (draftItems.length === 0) {
      dispatch(showToast({ type: 'warning', message: 'Order must contain at least one item' }));
      return;
    }
    setLoading(true);
    try {
      const items = draftItems.map((it) => ({
        service: it.service,
        material: it.material,
        item: it.item,
        quantity: it.quantity,
      }));
      await updateBill(orderId, items);
      setIsEditing(false);
      fetchOrder();
      dispatch(showToast({ type: 'success', message: 'Order updated successfully' }));
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to update order' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (silent = false) => {
    try {
      const r = await getOrderDetail(orderId, silent ? { hideLoader: true } : undefined);
      const o = r?.data?.order || r?.data;
      if (o) {
        setOrder(o);
        setVerifiedItems((o.items || []).map((i: any) => ({ ...i, verifiedQty: i.verifiedQuantity || i.quantity })));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleRespond = async (action: string) => {
    if (action === 'reject') {
      setRejectReason('');
      setRejectModalVisible(true);
      return;
    }
    try {
      await respondToOrder(orderId, action);
      fetchOrder();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Action failed' }));
    }
  };

  const handleConfirmReject = async () => {
    setRejectLoading(true);
    try {
      await respondToOrder(orderId, 'reject', rejectReason.trim() || undefined);
      setRejectModalVisible(false);
      fetchOrder();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to reject order' }));
    } finally {
      setRejectLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'accept_pickup':
          await acceptOrder(orderId);
          break;
        case 'picked_up':
          await updateOrderStatus(orderId, 'picked_up');
          break;
        case 'processing':
          await updateOrderStatus(orderId, 'processing');
          break;
        case 'ready':
          await updateOrderStatus(orderId, 'ready');
          break;
        case 'out_for_delivery':
          await updateOrderStatus(orderId, 'out_for_delivery');
          break;
        case 'delivered':
          await updateOrderStatus(orderId, 'delivered');
          break;
        case 'completed':
          await updateOrderStatus(orderId, 'completed');
          break;
        case 'reattempt':
          Alert.alert('Reattempt Delivery', 'Mark order as out for delivery again for reattempt?', [
            { text: 'Cancel' },
            { text: 'Yes, Reattempt', onPress: async () => { await updateOrderStatus(orderId, 'out_for_delivery'); fetchOrder(); } },
          ]);
          setLoading(false);
          return;
        case 'failed':
          Alert.alert('Failed Delivery', 'Mark as failed delivery?', [
            { text: 'No' },
            { text: 'Yes', onPress: async () => { await failDelivery(orderId); fetchOrder(); } },
          ]);
          setLoading(false);
          return;
      }
      fetchOrder();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Action failed' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBill = async () => {
    setLoading(true);
    try {
      const items = verifiedItems.map((i) => ({
        item: i.item?._id || i.item,
        material: i.material?._id || i.material,
        service: i.service?._id || i.service,
        quantity: i.verifiedQty
      }));
      await updateBill(orderId, items);
      fetchOrder();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to update bill' }));
    } finally {
      setLoading(false);
    }
  };

  const updateVerifiedQty = (idx: number, delta: number) => {
    setVerifiedItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, verifiedQty: Math.max(0, it.verifiedQty + delta) } : it))
    );
  };

  if (!order) return <ScreenWrapper><Header title="Order" showBack onBack={() => navigation.goBack()} /></ScreenWrapper>;
  const isFailedDelivery = order.status === 'failed_delivery';
  // For failed_delivery, show timeline up to out_for_delivery as the last completed step
  const effectiveStatus = isFailedDelivery ? 'out_for_delivery' : order.status;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(effectiveStatus);
  const isAssignedToMe = (order.helper?._id || order.helper) === user?._id;

  const ActionButton = () => {
    const statusActions: Record<string, { label: string; action: string; icon: keyof typeof Ionicons.glyphMap }> = {
      accepted: { label: 'Mark Picked Up', action: 'picked_up', icon: 'bicycle-outline' },
      picked_up: { label: 'Start Processing', action: 'processing', icon: 'water-outline' },
      processing: { label: 'Mark Ready', action: 'ready', icon: 'shirt-outline' },
      ready: { label: 'Out for Delivery', action: 'out_for_delivery', icon: 'car-outline' },
      delivered: { label: 'Collect Payment', action: 'completed', icon: 'cash-outline' },
    };
    const a = statusActions[order.status];
    if (!a) return null;

    const isWaitingForConfirmation = order.status === 'accepted' && order.billUpdated && !order.billConfirmed;

    if (isWaitingForConfirmation) {
      return (
        <Card padding="medium" style={{ marginTop: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.warning, backgroundColor: theme.colors.surfaceVariant }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.warning} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>Waiting for Customer Confirmation</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                You updated the bill. The customer must confirm the updated bill before you can mark the order as picked up.
              </Text>
            </View>
          </View>
        </Card>
      );
    }

    // For 'delivered' status, open the payment modal instead of directly completing
    const onPress = a.action === 'completed'
      ? () => setPaymentModalVisible(true)
      : () => handleAction(a.action);
    return <Button title={a.label} onPress={onPress} loading={loading} icon={a.icon} style={{ marginTop: 16 }} />;
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={order.orderNumber || 'Order'} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Badge status={order.status} size="medium" style={{ marginBottom: 16 }} />
        
        {/* Customer Details */}
        <Card padding="medium" style={{ marginBottom: 12 }}>
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 8 }]}>👤 Customer Details</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>{order.customer?.name || 'N/A'}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{order.customer?.email}</Text>
          {order.customer?.mobileNumber && (
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              📞 {order.customer.mobileNumber}
            </Text>
          )}

          {order.scheduledPickup && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
              <Ionicons name="calendar" size={16} color={theme.colors.primary} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textPrimary, marginLeft: 6, fontWeight: '600' }]}>
                Pickup Slot: {formatDate(order.scheduledPickup.date)} ({order.scheduledPickup.slot})
              </Text>
            </View>
          )}

          {(order.address || order.deliveryAddress) && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 10 }}>
              <Ionicons name="location" size={18} color={theme.colors.primary} style={{ marginTop: 2 }} />
              <View style={{ marginLeft: 6, flex: 1 }}>
                <Text style={[theme.typography.labelSmall, { color: theme.colors.textPrimary }]}>
                  {(order.address || order.deliveryAddress).label || 'Delivery Address'}
                </Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {(order.address || order.deliveryAddress).addressLine1}
                  {(order.address || order.deliveryAddress).addressLine2 ? `, ${(order.address || order.deliveryAddress).addressLine2}` : ''}
                  {`\n`}{(order.address || order.deliveryAddress).city}, {(order.address || order.deliveryAddress).state} - {(order.address || order.deliveryAddress).pincode}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Timeline Status */}
        <Card padding="medium" style={{ marginBottom: 12 }}>
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 8 }]}>Timeline</Text>
          {ORDER_STATUS_FLOW.map((s: any, i: number) => {
            const colorKey = getStatusColorKey(s);
            const isCurrent = !isFailedDelivery && i === currentIdx;
            return (
              <View key={s} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', width: 20 }}>
                  <View style={{ width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: 7,
                    backgroundColor: i <= currentIdx && colorKey ? (theme.colors as any)[colorKey] : theme.colors.border }} />
                  {i < ORDER_STATUS_FLOW.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: i <= currentIdx ? theme.colors.primary : theme.colors.border }} />}
                </View>
                <Text style={[theme.typography.bodySmall, { marginLeft: 12, paddingBottom: 14,
                  color: i <= currentIdx ? theme.colors.textPrimary : theme.colors.textMuted, fontWeight: isCurrent ? '700' : '400' }]}>
                  {getStatusLabel(s)}
                </Text>
              </View>
            );
          })}
          {/* Failed Delivery node appended to timeline */}
          {isFailedDelivery && (
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <View style={{ alignItems: 'center', width: 20 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: (theme.colors as any).statusFailed || theme.colors.error }} />
              </View>
              <Text style={[theme.typography.bodySmall, { marginLeft: 12, paddingBottom: 4,
                color: theme.colors.error, fontWeight: '700' }]}>
                ⚠️ Failed Delivery
              </Text>
            </View>
          )}
        </Card>

        {/* Order Items with verification or editing */}
        {isEditing ? (
          <Card padding="medium" style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>Edit Order Items</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* List of draft items */}
            {draftItems.map((it: any, i: number) => (
              <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 10 } as any]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                    {it.itemName}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {it.materialName} · {it.serviceName}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                    Price: {formatPrice(it.price)} · Subtotal: {formatPrice(it.price * it.quantity)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => handleUpdateDraftQty(i, -1)} style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[theme.typography.label, { minWidth: 28, textAlign: 'center', color: theme.colors.textPrimary }]}>{it.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateDraftQty(i, 1)} style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteDraftItem(i)} style={{ marginLeft: 12, padding: 4 }}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Divider spacing={12} />

            {/* Add New Item Form */}
            <View style={[styles.addItemForm, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.borderLight }]}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginBottom: 8 }]}>➕ Add New Item</Text>
              
              {/* Service Selection */}
              <TouchableOpacity
                style={[styles.selectBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => openPicker('Select Service', catalog.services, (opt) => setSelectedService(opt))}
              >
                <Text style={[theme.typography.body, { color: selectedService ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {selectedService ? selectedService.name : 'Select Service'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Material Selection */}
              <TouchableOpacity
                style={[styles.selectBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => openPicker('Select Material', catalog.materials, (opt) => setSelectedMaterial(opt))}
              >
                <Text style={[theme.typography.body, { color: selectedMaterial ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {selectedMaterial ? selectedMaterial.name : 'Select Material'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Cloth / Item Selection */}
              <TouchableOpacity
                style={[styles.selectBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => openPicker('Select Cloth/Item', catalog.items, (opt) => setSelectedItem(opt))}
              >
                <Text style={[theme.typography.body, { color: selectedItem ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {selectedItem ? selectedItem.name : 'Select Cloth/Item'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Quantity Selector */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>Quantity</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => setSelectedQty(q => Math.max(1, q - 1))} style={[styles.stepBtn, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[theme.typography.label, { minWidth: 28, textAlign: 'center', color: theme.colors.textPrimary }]}>{selectedQty}</Text>
                  <TouchableOpacity onPress={() => setSelectedQty(q => q + 1)} style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Add to List"
                onPress={handleAddDraftItem}
                disabled={!selectedService || !selectedMaterial || !selectedItem}
                variant="secondary"
                size="small"
                icon="add-circle-outline"
              />
            </View>

            <Divider spacing={16} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="Save Changes" onPress={handleSaveEdits} loading={loading} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="outline" style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Card padding="medium" style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>Items</Text>
              {(order.status === 'accepted' || order.status === 'pickup') && (
                <TouchableOpacity onPress={startEditing} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                  <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 4 }]}>Edit Items</Text>
                </TouchableOpacity>
              )}
            </View>
            {(order.items || []).map((it: any, i: number) => (
              <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 10 } as any]}>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                    {it.itemName || it.item?.name || 'Item'}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {it.materialName || it.material?.name || ''} · {it.serviceName || it.service?.name || ''}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Quantity: {it.quantity}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>× {it.quantity}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{formatPrice(it.price * it.quantity)}</Text>
                </View>
              </View>
            ))}
            <Divider spacing={8} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>Total</Text>
              <Text style={[theme.typography.price, { color: theme.colors.primary }]}>{formatPrice(order.pricing?.total || 0)}</Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={{ gap: 12 }}>
            <Button title="Accept Order" onPress={() => handleRespond('accept')} icon="checkmark-circle-outline" />
            <Button title="Reject Order" onPress={() => handleRespond('reject')} variant="danger" icon="close-circle-outline" />
          </View>
        )}

        {order.status !== 'pending' && order.status !== 'rejected' && order.status !== 'cancelled' && !isFailedDelivery && (
          <View style={{ marginTop: 8 }}>
            {!order.helper || (typeof order.helper === 'object' ? order.helper._id : order.helper) !== user?._id ? (
              order.status === 'accepted' && (
                <Button title="I will Pick Up" onPress={() => handleAction('accept_pickup')} loading={loading} icon="bicycle-outline" />
              )
            ) : (
              <View style={{ gap: 12 }}>
                <ActionButton />
                {order.status === 'out_for_delivery' && (
                  <View style={{ gap: 12 }}>
                    <Button title="Mark Delivered" onPress={() => handleAction('delivered')} loading={loading} icon="checkmark-outline" />
                    <Button title="Failed Delivery" onPress={() => handleAction('failed')} variant="danger" icon="close-circle-outline" />
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Failed Delivery — Reattempt */}
        {isFailedDelivery && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <Card padding="medium" style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.error, backgroundColor: theme.colors.surfaceVariant }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="alert-circle" size={22} color={theme.colors.error} />
                <Text style={[theme.typography.label, { color: theme.colors.error, marginLeft: 8 }]}>Delivery Failed</Text>
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                The delivery attempt was unsuccessful. You or an assigned helper can reattempt the delivery.
              </Text>
            </Card>
            <Button
              title="Reattempt Delivery"
              onPress={() => handleAction('reattempt')}
              loading={loading}
              icon="refresh-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Option Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{pickerTitle}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {pickerOptions.map((opt) => (
                <TouchableOpacity
                  key={opt._id}
                  style={[styles.pickerOptionRow, { borderBottomColor: theme.colors.divider }]}
                  onPress={() => onSelectOption(opt)}
                >
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>{opt.name}</Text>
                  {opt.price != null && opt.price > 0 && (
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.primary }]}>+₹{opt.price}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Payment Collection Modal ───────────────────────────────── */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.paymentModalContent, { backgroundColor: theme.colors.surface }]}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Collect Payment</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Order {order?.orderNumber}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Amount banner */}
            <View style={[styles.amountBanner, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 2 }]}>Total Amount Due</Text>
              <Text style={[theme.typography.h1, { color: theme.colors.primary, fontSize: 36, fontWeight: '800' }]}>
                ₹{(order?.pricing?.total ?? order?.pricing?.finalTotal ?? 0).toFixed(2)}
              </Text>
            </View>

            {/* Method selector */}
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 10, marginTop: 4 }]}>
              Choose payment method
            </Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodChip,
                  {
                    backgroundColor: selectedPaymentMethod === 'cash' ? theme.colors.primary : theme.colors.surfaceVariant,
                    borderColor: selectedPaymentMethod === 'cash' ? theme.colors.primary : theme.colors.borderLight,
                  },
                ]}
                onPress={() => setSelectedPaymentMethod('cash')}
              >
                <Ionicons name="cash-outline" size={22} color={selectedPaymentMethod === 'cash' ? '#FFF' : theme.colors.textSecondary} />
                <Text style={[theme.typography.label, { color: selectedPaymentMethod === 'cash' ? '#FFF' : theme.colors.textSecondary, marginTop: 6 }]}>Cash</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodChip,
                  {
                    backgroundColor: selectedPaymentMethod === 'upi' ? theme.colors.primary : theme.colors.surfaceVariant,
                    borderColor: selectedPaymentMethod === 'upi' ? theme.colors.primary : theme.colors.borderLight,
                    opacity: ownerUpiId ? 1 : 0.45,
                  },
                ]}
                onPress={() => {
                  if (!ownerUpiId) {
                    dispatch(showToast({ type: 'warning', message: 'Add your UPI ID in Settings first' }));
                    return;
                  }
                  setSelectedPaymentMethod('upi');
                }}
              >
                <Ionicons name="qr-code-outline" size={22} color={selectedPaymentMethod === 'upi' ? '#FFF' : theme.colors.textSecondary} />
                <Text style={[theme.typography.label, { color: selectedPaymentMethod === 'upi' ? '#FFF' : theme.colors.textSecondary, marginTop: 6 }]}>UPI</Text>
                {!ownerUpiId && (
                  <Text style={[theme.typography.caption, { color: theme.colors.error, marginTop: 2, fontSize: 9 }]}>Not set</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* UPI QR Code — shown when UPI selected and UPI ID is available */}
            {selectedPaymentMethod === 'upi' && ownerUpiId && (() => {
              const amount = (order?.pricing?.total ?? order?.pricing?.finalTotal ?? 0).toFixed(2);
              const upiString = `upi://pay?pa=${encodeURIComponent(ownerUpiId)}&pn=${encodeURIComponent(ownerLaundryName || 'FreshWash')}&am=${amount}&cu=INR`;
              return (
                <View style={styles.qrSection}>
                  <View style={[styles.qrBox, { borderColor: theme.colors.borderLight, backgroundColor: '#FFFFFF' }]}>
                    <UpiQrCode value={upiString} size={210} backgroundColor="#FFFFFF" color="#111111" />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginTop: 12, textAlign: 'center' }]}>
                    {ownerUpiId}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 3, textAlign: 'center' }]}>
                    Scan to pay ₹{amount} · GPay · PhonePe · Paytm · Any UPI
                  </Text>
                </View>
              );
            })()}

            {/* Cash instruction */}
            {selectedPaymentMethod === 'cash' && (
              <View style={[styles.cashInfo, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.borderLight }]}>
                <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginLeft: 10, flex: 1 }]}>
                  Collect ₹{(order?.pricing?.total ?? order?.pricing?.finalTotal ?? 0).toFixed(2)} in cash from the customer, then confirm below.
                </Text>
              </View>
            )}

            {/* Confirm button */}
            <Button
              title={selectedPaymentMethod === 'upi' ? 'Mark as Paid & Complete' : 'Confirm Cash & Complete'}
              icon="checkmark-circle-outline"
              loading={loading}
              onPress={async () => {
                setPaymentModalVisible(false);
                await handleAction('completed');
              }}
              style={{ marginTop: 16 }}
            />

          </View>
        </View>
      </Modal>

      {/* ── Reject Order Modal ───────────────────────────────────── */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.rejectModalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.rejectModalHeader}>
              <View style={[styles.rejectIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Reject Order</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  The customer will be notified with your reason.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Reason input */}
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginBottom: 8, marginTop: 4 }]}>
              Reason for rejection{' '}
              <Text style={{ color: theme.colors.textMuted, fontWeight: '400' }}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.rejectInput, {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.borderLight,
                color: theme.colors.textPrimary,
              }]}
              placeholder="e.g. Out of service area, fully booked, item not accepted..."
              placeholderTextColor={theme.colors.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, textAlign: 'right', marginBottom: 16 }]}>
              {rejectReason.length}/300
            </Text>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Cancel"
                onPress={() => setRejectModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Reject"
                onPress={handleConfirmReject}
                variant="danger"
                loading={rejectLoading}
                icon="close-circle-outline"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  addItemForm: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 12 },
  selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '60%' },
  paymentModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12 },
  pickerOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  amountBanner: { alignItems: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  methodChip: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1.5 },
  qrSection: { alignItems: 'center', marginBottom: 8 },
  qrBox: { padding: 14, borderRadius: 16, borderWidth: 1 },
  cashInfo: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
  rejectModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  rejectModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rejectIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rejectInput: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 90, fontSize: 14, marginBottom: 6 },
});
