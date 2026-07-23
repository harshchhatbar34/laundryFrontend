import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity, Modal, Clipboard, Platform, Linking } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Divider from '../../components/ui/Divider';
import { useTheme } from '../../theme/ThemeContext';
import { getHelperOrderDetail, acceptOrder, updateOrderStatus, failDelivery, updateBill } from '../../api/helper';
import { getServices as getOwnerServices } from '../../api/owner';
import { formatPrice, formatDate, getStatusLabel, getStatusColorKey } from '../../utils/helpers';
import { openGoogleMapsNavigation } from '../../utils/routing';
import { ORDER_STATUS_FLOW } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HelperStackParamList } from '../../navigation/HelperStack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<HelperStackParamList, 'HelperOrderDetail'>;

export default function HelperOrderDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [verifiedItems, setVerifiedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
      price: (selectedService.price || 0) + (selectedMaterial.price || 0) + (selectedItem.price || 0), // display-only estimate; backend recalculates from DB
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

  const fetchOrder = async () => {
    try {
      const res = await getHelperOrderDetail(orderId);
      const o = res?.data?.order || res?.data;
      if (o) { setOrder(o); setVerifiedItems((o.items || []).map((i: any) => ({ ...i, verifiedQty: i.verifiedQuantity || i.quantity }))); }
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'accept': await acceptOrder(orderId); break;
        case 'picked_up': await updateOrderStatus(orderId, 'picked_up'); break;
        case 'processing': await updateOrderStatus(orderId, 'processing'); break;
        case 'ready': await updateOrderStatus(orderId, 'ready'); break;
        case 'out_for_delivery': await updateOrderStatus(orderId, 'out_for_delivery'); break;
        case 'delivered': await updateOrderStatus(orderId, 'delivered'); break;
        case 'completed': await updateOrderStatus(orderId, 'completed'); break;
        case 'reattempt':
          Alert.alert('Reattempt Delivery', 'Mark order as out for delivery again for reattempt?', [
            { text: 'Cancel' },
            { text: 'Yes, Reattempt', onPress: async () => { await updateOrderStatus(orderId, 'out_for_delivery'); fetchOrder(); } },
          ]);
          setLoading(false); return;
        case 'failed':
          Alert.alert('Failed Delivery', 'Mark as failed delivery?', [
            { text: 'No' },
            { text: 'Yes', onPress: async () => { await failDelivery(orderId); fetchOrder(); } },
          ]);
          setLoading(false); return;
      }
      fetchOrder();
    } catch (e) { dispatch(showToast({ type: 'error', message: 'Action failed' })); }
    finally { setLoading(false); }
  };

  const handleUpdateBill = async () => {
    setLoading(true);
    try {
      const items = verifiedItems.map((i) => ({ item: i.item, material: i.material, service: i.service, quantity: i.verifiedQty }));
      await updateBill(orderId, items);
      fetchOrder();
    } catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to update bill' })); }
    finally { setLoading(false); }
  };

  const updateVerifiedQty = (idx: number, delta: number) => {
    setVerifiedItems((prev) => prev.map((it, i) => i === idx ? { ...it, verifiedQty: Math.max(0, it.verifiedQty + delta) } : it));
  };

  if (!order) return <ScreenWrapper><Header title="Order" showBack onBack={() => navigation.goBack()} /></ScreenWrapper>;

  const isFailedDelivery = order.status === 'failed_delivery';
  // For failed_delivery, show timeline up to out_for_delivery as the last completed step
  const effectiveStatus = isFailedDelivery ? 'out_for_delivery' : order.status;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(effectiveStatus);

  const ActionButton = () => {
    const statusActions: Record<string, { label: string; action: string; icon: keyof typeof Ionicons.glyphMap }> = {
      pending: { label: 'Accept Order', action: 'accept', icon: 'checkmark-circle-outline' },
      accepted: { label: 'Mark Picked Up', action: 'picked_up', icon: 'bicycle-outline' },
      picked_up: { label: 'Start Processing', action: 'processing', icon: 'water-outline' },
      processing: { label: 'Mark Ready', action: 'ready', icon: 'shirt-outline' },
      ready: { label: 'Out for Delivery', action: 'out_for_delivery', icon: 'car-outline' },
      delivered: { label: 'Collect Payment & Complete', action: 'completed', icon: 'cash-outline' },
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

    return <Button title={a.label} onPress={() => handleAction(a.action)} loading={loading} icon={a.icon} style={{ marginTop: 16 }} />;
  };

  const openCustomerNavigation = (addrObj: any) => {
    if (!addrObj) return;

    const lat = Number(addrObj.latitude || addrObj.lat || (addrObj.location?.coordinates && addrObj.location.coordinates[1]));
    const lng = Number(addrObj.longitude || addrObj.lng || (addrObj.location?.coordinates && addrObj.location.coordinates[0]));

    const addressLine = addrObj.addressLine1 || addrObj.line1 || addrObj.streetAddress || addrObj.addressLine || addrObj.address || '';
    const addressLine2 = addrObj.addressLine2 || addrObj.line2 || '';
    const landmark = addrObj.landmark ? `Near ${addrObj.landmark}` : '';
    const city = addrObj.city || '';
    const state = addrObj.state || '';
    const pincode = addrObj.pincode || '';

    const parts = [addressLine, addressLine2, landmark, city, state, pincode, 'India'].filter(Boolean);
    const fullAddress = parts.length > 0 ? parts.join(', ') : (addrObj.fullAddress || '');

    openGoogleMapsNavigation(isNaN(lat) ? undefined : lat, isNaN(lng) ? undefined : lng, fullAddress);
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={order.orderNumber || 'Order'} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Badge status={order.status} size="medium" style={{ marginBottom: 16 }} />
        
        {/* Customer Details */}
        <Card padding="medium" style={{ marginBottom: 12 }}>
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>👤 Customer Details</Text>

          {/* Name + Avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.primary }}>
                {(order.customer?.name || 'N').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
                {order.customer?.name || 'N/A'}
              </Text>
              {order.customer?.email && (
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 1 }]}>
                  {order.customer.email}
                </Text>
              )}
            </View>
          </View>

          {/* Phone number with small copy icon beside number */}
          {order.customer?.mobileNumber && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#10B98120', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="call" size={15} color="#10B981" />
              </View>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                Phone number: <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{order.customer.mobileNumber}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(order.customer.mobileNumber);
                  dispatch(showToast({ type: 'success', message: 'Phone number copied!' }));
                }}
                style={{ marginLeft: 6, padding: 2 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Pickup Slot */}
          {order.scheduledPickup && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="calendar" size={15} color={theme.colors.primary} />
              </View>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textPrimary, fontWeight: '600', flex: 1 }]}>
                {formatDate(order.scheduledPickup.date)} · {order.scheduledPickup.slot}
              </Text>
            </View>
          )}

          {/* Address + Navigation Button */}
          {(order.address || order.deliveryAddress) && (
            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 }}>
                  <Ionicons name="location" size={15} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                      {(order.address || order.deliveryAddress).label || 'Pickup Address'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openCustomerNavigation(order.address || order.deliveryAddress)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#3B82F615',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        gap: 4,
                      }}
                    >
                      <Ionicons name="navigate-outline" size={14} color="#3B82F6" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#3B82F6' }}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, lineHeight: 20 }]}>
                    {(order.address || order.deliveryAddress).addressLine1}
                    {(order.address || order.deliveryAddress).addressLine2 ? `, ${(order.address || order.deliveryAddress).addressLine2}` : ''}
                    {`\n`}{(order.address || order.deliveryAddress).city}, {(order.address || order.deliveryAddress).state} — {(order.address || order.deliveryAddress).pincode}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Timeline */}
        <Card padding="medium" style={{ marginBottom: 12 }}>
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>Timeline</Text>
          {ORDER_STATUS_FLOW.map((status: any, idx: number) => {
            const isActive = idx <= currentIdx;
            // When failed delivery, the last step (out_for_delivery) shows as current but not bold/highlighted as normal
            const isCurrent = !isFailedDelivery && idx === currentIdx;
            const colorKey = getStatusColorKey(status);
            return (
              <View key={status} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', width: 20 }}>
                  <View style={{ width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: 7,
                    backgroundColor: isActive && colorKey ? (theme.colors as any)[colorKey] : theme.colors.border }} />
                  {idx < ORDER_STATUS_FLOW.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: isActive ? theme.colors.primary : theme.colors.border }} />}
                </View>
                <Text style={[theme.typography.bodySmall, { marginLeft: 12, paddingBottom: 14,
                  color: isActive ? theme.colors.textPrimary : theme.colors.textMuted, fontWeight: isCurrent ? '700' : '400' }]}>
                  {getStatusLabel(status)}
                </Text>
              </View>
            );
          })}
          {/* Failed Delivery Banner inside timeline */}
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

        <ActionButton />

        {order.status === 'out_for_delivery' && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <Button title="Mark Delivered" onPress={() => handleAction('delivered')} loading={loading} icon="checkmark-outline" />
            <Button title="Failed Delivery" onPress={() => handleAction('failed')} variant="danger" icon="close-circle-outline" />
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
                The delivery attempt was unsuccessful. You can reattempt the delivery once you are ready.
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12 },
  pickerOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
