import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Divider from '../../components/ui/Divider';
import SearchBar from '../../components/ui/SearchBar';
import SlideUpModal from '../../animations/SlideUpModal';
import { useTheme } from '../../theme/ThemeContext';
import { getPlatformCustomers, getCustomerDetails, getPlatformOrders } from '../../api/admin';
import { getOwnerCustomers, getOwnerOrders } from '../../api/owner';
import { RootState } from '../../store';
import { showToast } from '../../store/slices/uiSlice';
import { formatDate, formatPrice } from '../../utils/helpers';
import FadeSlideIn from '../../animations/FadeSlideIn';

interface Customer {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenant?: {
    _id: string;
    tenantCode: string;
    laundryName: string;
    owner: string;
  };
  orders?: any[];
}

export default function CustomerManagementScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'superadmin';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Paginated Orders inside details modal
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = isSuperAdmin
        ? await getPlatformCustomers({ search: searchQuery })
        : await getOwnerCustomers({ search: searchQuery });

      if (response?.data) {
        const raw = Array.isArray(response.data) ? response.data : response.data.customers || [];
        setCustomers(raw);
      }
    } catch (e) {
      console.error('Error fetching customers:', e);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const fetchCustomerOrders = useCallback(async (customerId: string, pageNum: number, searchQ: string, isAppend = false) => {
    if (pageNum === 1) {
      setOrdersLoading(true);
    } else {
      setOrdersLoadingMore(true);
    }

    try {
      const response = isSuperAdmin
        ? await getPlatformOrders({ customerId, page: pageNum, limit: 10, search: searchQ })
        : await getOwnerOrders({ customerId, page: pageNum, limit: 10, search: searchQ });

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
  }, [isSuperAdmin]);

  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomer(null);
    setUserOrders([]);
    setOrdersPage(1);
    setOrdersTotalPages(1);
    setOrderSearchQuery('');
    setModalVisible(true);
    
    // 1. Fetch Customer Details
    setDetailLoading(true);
    try {
      if (isSuperAdmin) {
        const res = await getCustomerDetails(customer._id);
        if (res?.data?.customer) {
          setSelectedCustomer(res.data.customer);
        } else {
          setSelectedCustomer(customer);
        }
      } else {
        setSelectedCustomer(customer);
      }
    } catch {
      dispatch(showToast({ type: 'error', message: 'Failed to load customer details' }));
      setSelectedCustomer(customer);
    } finally {
      setDetailLoading(false);
    }

    // 2. Fetch Customer Orders for page 1
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

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View style={[styles.detailRow, { borderBottomColor: theme.colors.borderLight }]}>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]}>
        {label}
      </Text>
      <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' }]} numberOfLines={2}>
        {value || 'N/A'}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: Customer; index: number }) => (
    <FadeSlideIn delay={index * 50}>
      <Card style={{ marginBottom: 12 }} padding="medium" onPress={() => handleOpenDetail(item)}>
        <View style={styles.row}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '10' }]}>
            <Text style={[theme.typography.subtitle, { color: theme.colors.primary, fontWeight: '700' }]}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>

          {/* Info */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.titleRow}>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600', flex: 1 }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Badge
                label={item.isActive ? 'Active' : 'Inactive'}
                color={item.isActive ? theme.colors.success : theme.colors.error}
              />
            </View>

            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
              ✉️ {item.email}
            </Text>
            
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
              📱 {item.mobileNumber || 'No phone number'}
            </Text>

            {isSuperAdmin && item.tenant && (
              <View style={styles.tenantRow}>
                <Ionicons name="business" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={[theme.typography.caption, { color: theme.colors.primary, fontWeight: '500' }]} numberOfLines={1}>
                  {item.tenant.laundryName} ({item.tenant.tenantCode})
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Customers" showBack onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <SearchBar
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          resultCount={customers.length}
        />
      </View>
      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCustomers} colors={[theme.colors.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={searchQuery ? "No Matching Customers" : "No Customers Found"}
            description={searchQuery ? "Try refining your search query" : "No customers are registered yet."}
          />
        }
      />

      <SlideUpModal visible={modalVisible} onClose={() => setModalVisible(false)} height={540}>
        <View style={styles.modalContent}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 16 }]}>
            Customer Details
          </Text>
          
          {detailLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : selectedCustomer ? (
            <FlatList
              data={userOrders}
              keyExtractor={(order) => order._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              onEndReached={handleLoadMoreOrders}
              onEndReachedThreshold={0.2}
              ListHeaderComponent={
                <View>
                  <View style={styles.modalHeader}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '10', width: 60, height: 60, borderRadius: 20, alignSelf: 'center' }]}>
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
                  <DetailRow label="Registered Date" value={formatDate(selectedCustomer.createdAt)} />

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
      </SlideUpModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  modalContent: { flex: 1, padding: 20 },
  modalHeader: { alignItems: 'stretch', marginBottom: 8 },
  detailRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
});
