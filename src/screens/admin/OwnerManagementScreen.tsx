import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  Alert, StyleSheet, ActivityIndicator, ScrollView, Switch,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Divider from '../../components/ui/Divider';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import SlideUpModal from '../../animations/SlideUpModal';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { formatDate, formatPrice } from '../../utils/helpers';
import { getOwners, toggleOwner, getOwnerDetails, getPlatformCustomers, getCustomerDetails, getPlatformOrders } from '../../api/admin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminOwnerStackParamList } from '../../navigation/AdminTabs';

type Props = NativeStackScreenProps<AdminOwnerStackParamList, 'OwnerManagement'>;

interface DetailRowProps {
  label: string;
  value?: string | number | null;
}

export default function OwnerManagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [owners, setOwners] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Track which owner IDs are currently toggling (for inline spinner)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Modal view states
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'owner_detail' | 'customer_list' | 'customer_detail'>('owner_detail');

  // Detail Modal States (Owner)
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Customers Modal States (List)
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Customer Details Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const fetchOwners = useCallback(async () => {
    try {
      const r = await getOwners();
      if (r?.data) {
        const rawOwners = Array.isArray(r.data) ? r.data : r.data.owners || [];
        const seen = new Set();
        const deduped = rawOwners.filter((o: any) => {
          if (!o?._id) return false;
          if (seen.has(o._id)) return false;
          seen.add(o._id);
          return true;
        });
        setOwners(deduped);
      }
    } catch (e) {
      console.error('Error fetching owners:', e);
    }
  }, []);

  useEffect(() => {
    const u = navigation.addListener('focus', fetchOwners);
    return u;
  }, [navigation, fetchOwners]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOwners();
    setRefreshing(false);
  };

  // ── Inline toggle on list card ────────────────────────────────────────
  const handleListToggle = (item: any, newValue: boolean) => {
    const action = newValue ? 'unblock' : 'block';
    const actionLabel = newValue ? 'Unblock' : 'Block';

    Alert.alert(
      `${actionLabel} Owner`,
      `Are you sure you want to ${action} "${item.name}"?\n${
        newValue
          ? 'They will regain full access to the app.'
          : 'Their login will be disabled immediately.'
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: newValue ? 'default' : 'destructive',
          onPress: async () => {
            setTogglingIds(prev => new Set(prev).add(item._id));
            try {
              await toggleOwner(item._id, newValue);
              setOwners(prev =>
                prev.map(o => o._id === item._id ? { ...o, isActive: newValue } : o)
              );
              // Keep modal in sync if it is open for the same owner
              setSelectedOwner((prev: any) =>
                prev?._id === item._id ? { ...prev, isActive: newValue } : prev
              );
            } catch {
              dispatch(showToast({ type: 'error', message: 'Failed to update owner status' }));
            } finally {
              setTogglingIds(prev => {
                const next = new Set(prev);
                next.delete(item._id);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  // ── Detail modal ──────────────────────────────────────────────────────
  const handleOpenDetail = async (ownerId: string) => {
    setSelectedOwner(null);
    setViewMode('owner_detail');
    setModalVisible(true);
    setDetailLoading(true);
    try {
      const res = await getOwnerDetails(ownerId);
      if (res?.data?.owner) {
        setSelectedOwner(res.data.owner);
      }
    } catch {
      dispatch(showToast({ type: 'error', message: 'Failed to load owner details' }));
      setModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedOwner) return;
    setModalVisible(false);
    setTimeout(() => navigation.navigate('EditOwner', { ownerId: selectedOwner._id }), 300);
  };

  const handleOpenCustomers = async () => {
    if (!selectedOwner) return;
    setCustomers([]);
    setViewMode('customer_list');
    setCustomersLoading(true);
    try {
      const res = await getPlatformCustomers({ ownerId: selectedOwner._id });
      if (res?.data?.customers) {
        setCustomers(res.data.customers);
      }
    } catch {
      dispatch(showToast({ type: 'error', message: 'Failed to load customers' }));
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchCustomerOrders = useCallback(async (customerId: string, pageNum: number, searchQ: string, isAppend = false) => {
    if (pageNum === 1) {
      setOrdersLoading(true);
    } else {
      setOrdersLoadingMore(true);
    }

    try {
      const response = await getPlatformOrders({ customerId, page: pageNum, limit: 10, search: searchQ });
      if (response?.data) {
        const raw = Array.isArray(response.data) ? response.data : response.data.orders || [];
        const totalP = response.data.totalPages || 1;
        setOrdersTotalPages(totalP);

        if (isAppend) {
          setUserOrders(prev => {
            const next = [...prev];
            raw.forEach((o: any) => {
              if (!next.some(existing => existing._id === o._id)) {
                next.push(o);
              }
            });
            return next;
          });
        } else {
          setUserOrders(raw);
        }
      }
    } catch (e) {
      console.error('Error fetching customer orders:', e);
      dispatch(showToast({ type: 'error', message: 'Failed to load recent orders' }));
    } finally {
      setOrdersLoading(false);
      setOrdersLoadingMore(false);
    }
  }, [dispatch]);

  const handleOpenCustomerDetail = async (customer: any) => {
    setSelectedCustomer(null);
    setUserOrders([]);
    setOrdersPage(1);
    setOrdersTotalPages(1);
    setOrderSearchQuery('');
    setViewMode('customer_detail');
    
    setCustomerDetailLoading(true);
    try {
      const res = await getCustomerDetails(customer._id);
      if (res?.data?.customer) {
        setSelectedCustomer(res.data.customer);
      } else {
        setSelectedCustomer(customer);
      }
    } catch {
      dispatch(showToast({ type: 'error', message: 'Failed to load customer details' }));
      setSelectedCustomer(customer);
    } finally {
      setCustomerDetailLoading(false);
    }

    fetchCustomerOrders(customer._id, 1, '');
  };

  const handleLoadMoreOrders = () => {
    if (ordersPage < ordersTotalPages && !ordersLoading && !ordersLoadingMore && selectedCustomer) {
      const nextPage = ordersPage + 1;
      setOrdersPage(nextPage);
      fetchCustomerOrders(selectedCustomer._id, nextPage, orderSearchQuery, true);
    }
  };

  const handleSearchOrders = (text: string) => {
    setOrderSearchQuery(text);
    if (selectedCustomer) {
      setOrdersPage(1);
      fetchCustomerOrders(selectedCustomer._id, 1, text, false);
    }
  };

  const DetailRow = ({ label, value }: DetailRowProps) => (
    <View style={styles.detailRow}>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]}>
        {label}
      </Text>
      <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' }]}>
        {value || 'N/A'}
      </Text>
    </View>
  );

  // ── List card ─────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isToggling = togglingIds.has(item._id);

    return (
      <FadeSlideIn delay={index * 60}>
        <Card style={{ marginBottom: 12 }} padding="medium">
          <TouchableOpacity
            style={styles.cardTop}
            onPress={() => handleOpenDetail(item._id)}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View style={[
              styles.avatar,
              { backgroundColor: item.isActive ? theme.colors.primaryBg : theme.colors.border },
            ]}>
              <Ionicons
                name="business"
                size={20}
                color={item.isActive ? theme.colors.primary : theme.colors.textMuted}
              />
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                {item.laundryName || 'No Name'}
              </Text>

              {/* Owner name row — with inline status + switch */}
              <View style={styles.nameRow}>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, flex: 1 }]}>
                  👤 {item.name}
                </Text>
                <View style={styles.toggleInline}>
                  <Text style={[
                    theme.typography.caption,
                    { color: item.isActive ? theme.colors.success : theme.colors.error, fontWeight: '700', marginRight: 4 },
                  ]}>
                    {item.isActive ? 'Active' : 'Blocked'}
                  </Text>
                  {isToggling ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 2 }} />
                  ) : (
                    <Switch
                      value={item.isActive}
                      onValueChange={(val) => handleListToggle(item, val)}
                      trackColor={{
                        false: theme.colors.error + '50',
                        true: theme.colors.success + '50',
                      }}
                      thumbColor={item.isActive ? theme.colors.success : theme.colors.error}
                      ios_backgroundColor={theme.colors.error + '50'}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                  )}
                </View>
              </View>

              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>
                📱 {item.mobileNumber || 'No mobile'}
              </Text>
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </Card>
      </FadeSlideIn>
    );
  };

  const filteredOwners = owners.filter((owner) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    
    const name = (owner.name || '').toLowerCase();
    const mobile = (owner.mobileNumber || '').toLowerCase();
    const laundry = (owner.tenant?.laundryName || owner.laundryName || '').toLowerCase();
    
    return name.includes(q) || mobile.includes(q) || laundry.includes(q);
  });

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Owners" showBack onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <SearchBar
          placeholder="Search by name, phone, or shop..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          resultCount={filteredOwners.length}
        />
      </View>
      <FlatList
        data={filteredOwners}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={<EmptyState icon="people-outline" title="No owners found" />}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateOwner')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary as any]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Unified Slide-Up Modal Stack */}
      <SlideUpModal visible={modalVisible} onClose={() => setModalVisible(false)} height={540} dragZoneHeight={0}>
        <View style={{ flex: 1, paddingTop: 8 }}>
          
          {/* Modal Navigation Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
            {viewMode !== 'owner_detail' && (
              <TouchableOpacity
                onPress={() => setViewMode(viewMode === 'customer_detail' ? 'customer_list' : 'owner_detail')}
                style={{ marginRight: 10, padding: 4 }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, flex: 1 }]}>
              {viewMode === 'owner_detail' ? 'Owner Details' : viewMode === 'customer_list' ? 'Customer List' : 'Customer Details'}
            </Text>
          </View>

          {/* Mode 1: Owner Details */}
          {viewMode === 'owner_detail' && (
            <View style={{ flex: 1 }} key="mode_owner_detail">
              {detailLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                    Loading details...
                  </Text>
                </View>
              ) : selectedOwner ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalAvatar, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Ionicons name="person" size={28} color={theme.colors.primary} />
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                        {selectedOwner.name}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        {selectedOwner.email}
                      </Text>
                      {selectedOwner.mobileNumber ? (
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                          📞 {selectedOwner.mobileNumber}
                        </Text>
                      ) : null}
                    </View>
                    <Badge
                      label={selectedOwner.isActive ? 'Active' : 'Blocked'}
                      color={selectedOwner.isActive ? theme.colors.success : theme.colors.error}
                    />
                  </View>

                  <Divider spacing={16} />

                  {/* Laundry Info */}
                  <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 10 }]}>
                    Laundry Shop
                  </Text>
                  <DetailRow label="Brand Name" value={selectedOwner.tenant?.laundryName} />
                  <DetailRow label="Tenant Code" value={`🔑 ${selectedOwner.tenant?.tenantCode}`} />
                  <DetailRow label="Average Rating" value={`⭐️ ${(selectedOwner.avgRating ?? 0).toFixed(1)}`} />
                  {selectedOwner.tenant?.address ? (
                    <DetailRow
                      label="Address"
                      value={[
                        selectedOwner.tenant.address,
                        selectedOwner.tenant.landmark,
                        selectedOwner.tenant.city,
                        selectedOwner.tenant.state,
                        selectedOwner.tenant.pincode,
                      ].filter(Boolean).join(', ')}
                    />
                  ) : null}

                  <Divider spacing={16} />

                  {/* Subscription */}
                  <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 10 }]}>
                    Subscription & Billing
                  </Text>
                  <DetailRow label="Plan" value={selectedOwner.tenant?.subscription?.toUpperCase()} />
                  <DetailRow label="Payment Mode" value={selectedOwner.tenant?.paymentMode?.toUpperCase()} />
                  <DetailRow label="Fee Amount" value={`₹${selectedOwner.tenant?.paymentAmount}`} />

                  <Divider spacing={16} />

                  {/* Branches */}
                  <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 10 }]}>
                    Branches ({selectedOwner.branches?.length || 0})
                  </Text>
                  {selectedOwner.branches && selectedOwner.branches.length > 0 ? (
                    selectedOwner.branches.map((b: any) => (
                      <View
                        key={b._id}
                        style={[
                          styles.branchRow,
                          { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.borderLight }
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                            {b.name}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                            📍 {b.addressLine || b.city || 'No address set'}
                          </Text>
                          {b.phone ? (
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                              📞 {b.phone}
                            </Text>
                          ) : null}
                        </View>
                        <Badge
                          label={b.isLive ? 'Live' : 'Closed'}
                          color={b.isLive ? theme.colors.success : theme.colors.textMuted}
                        />
                      </View>
                    ))
                  ) : (
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: 10 }]}>
                      No branches registered yet.
                    </Text>
                  )}

                  <Divider spacing={16} />

                  {/* Actions Row */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={handleEdit}
                      style={[
                        styles.editBtn,
                        { flex: 1, backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary },
                      ]}
                    >
                      <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                      <Text style={[theme.typography.label, { color: theme.colors.primary, marginLeft: 6 }]}>
                        Edit Owner
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleOpenCustomers}
                      style={[
                        styles.editBtn,
                        { flex: 1, backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success },
                      ]}
                    >
                      <Ionicons name="people-outline" size={18} color={theme.colors.success} />
                      <Text style={[theme.typography.label, { color: theme.colors.success, marginLeft: 6 }]}>
                        Customer List
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.loadingContainer}>
                  <Ionicons name="alert-circle-outline" size={40} color={theme.colors.textMuted} />
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                    Failed to load owner info
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Mode 2: Customer List */}
          {viewMode === 'customer_list' && (
            <View style={{ flex: 1 }} key="mode_customer_list">
              {customersLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                    Loading customers...
                  </Text>
                </View>
              ) : customers.length > 0 ? (
                <FlatList
                  data={customers}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenCustomerDetail(item)}
                      style={styles.customerRow}
                    >
                      <View style={[styles.customerAvatar, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                          {item.name}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                          ✉️ {item.email}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                          📱 {item.mobileNumber || 'No mobile number'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <Ionicons name="people-outline" size={40} color={theme.colors.textMuted} />
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
                    No customers registered under this owner
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Mode 3: Customer Details */}
          {viewMode === 'customer_detail' && (
            <View style={{ flex: 1 }} key="mode_customer_detail">
              {customerDetailLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
              ) : selectedCustomer ? (
                <FlatList
                  data={userOrders}
                  keyExtractor={(order) => order._id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                  onEndReached={handleLoadMoreOrders}
                  onEndReachedThreshold={0.2}
                  ListHeaderComponent={
                    <View>
                      <View style={{ alignItems: 'center', marginBottom: 12 }}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '10', width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={[theme.typography.h2, { color: theme.colors.primary, fontWeight: '700' }]}>
                            {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                          </Text>
                        </View>
                        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 12, textAlign: 'center' }]}>
                          {selectedCustomer.name}
                        </Text>
                        <View style={{ alignSelf: 'center', marginTop: 8 }}>
                          <Badge
                            label={selectedCustomer.isActive ? 'Active' : 'Inactive'}
                            color={selectedCustomer.isActive ? theme.colors.success : theme.colors.error}
                          />
                        </View>
                      </View>

                      <Divider spacing={16} />

                      <DetailRow label="Email Address" value={selectedCustomer.email} />
                      <DetailRow label="Mobile Number" value={selectedCustomer.mobileNumber} />
                      <DetailRow label="Registered Date" value={selectedCustomer.createdAt ? formatDate(selectedCustomer.createdAt) : ''} />

                      <Divider spacing={16} />
                      
                      <View style={{ marginBottom: 12 }}>
                        <SearchBar
                          placeholder="Search orders..."
                          value={orderSearchQuery}
                          onChangeText={handleSearchOrders}
                        />
                      </View>

                      <Text style={[theme.typography.label, { color: theme.colors.primary, marginBottom: 12, fontWeight: '700' }]}>
                        Recent Orders {userOrders.length > 0 ? `(${userOrders.length})` : ''}
                      </Text>

                      {ordersLoading && (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
                      )}
                    </View>
                  }
                  renderItem={({ item: order }) => (
                    <Card style={{ marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border }} padding="small">
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[theme.typography.label, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                            {order.orderNumber || `#${order._id?.slice(-6)}`}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                            {formatDate(order.createdAt)} {order.branch?.name ? `· ${order.branch.name}` : ''}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Badge status={order.status} size="small" />
                          <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginTop: 4, textAlign: 'right' }]}>
                            {formatPrice(order.pricing?.total || 0)}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  )}
                  ListEmptyComponent={
                    !ordersLoading ? (
                      <Text style={[theme.typography.caption, { color: theme.colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: 12 }]}>
                        No orders placed yet.
                      </Text>
                    ) : null
                  }
                  ListFooterComponent={
                    ordersLoadingMore ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
                    ) : userOrders.length > 0 && ordersPage >= ordersTotalPages ? (
                      <Text style={[theme.typography.caption, { color: theme.colors.textMuted, textAlign: 'center', marginVertical: 12 }]}>
                        No more orders
                      </Text>
                    ) : null
                  }
                />
              ) : (
                <EmptyState icon="person-outline" title="No details found" />
              )}
            </View>
          )}
        </View>
      </SlideUpModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Card
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  toggleInline: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },

  // Modal
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  modalAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: 12, borderWidth: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
});
