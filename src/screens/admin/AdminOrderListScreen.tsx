import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import Divider from '../../components/ui/Divider';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import SlideUpModal from '../../animations/SlideUpModal';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getPlatformOrders, getPlatformOrderDetails } from '../../api/admin';
import { formatPrice, formatDate } from '../../utils/helpers';

interface Order {
  _id: string;
  orderNumber: string;
  tenant: {
    _id: string;
    tenantCode: string;
    laundryName: string;
  };
  branch: {
    _id: string;
    name: string;
    city: string;
  };
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  pricing: {
    subtotal: number;
    discount: number;
    total: number;
  };
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminOrderListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPlatformOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      if (response?.data) {
        const raw = Array.isArray(response.data) ? response.data : response.data.orders || [];
        setOrders(raw);
      }
    } catch (e) {
      console.error('Error fetching platform orders:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(null);
    setModalVisible(true);
    setDetailLoading(true);
    try {
      const res = await getPlatformOrderDetails(order._id);
      if (res?.data?.order) {
        setSelectedOrder(res.data.order);
      } else {
        setSelectedOrder(order);
      }
    } catch {
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
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

  const renderItem = ({ item, index }: { item: Order; index: number }) => (
    <FadeSlideIn delay={index * 50}>
      <Card style={{ marginBottom: 12 }} padding="medium" onPress={() => handleOpenDetail(item)}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
              {item.orderNumber}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Badge status={item.status} size="small" />
        </View>

        <View style={[styles.infoContainer, { borderColor: theme.colors.border }]}>
          {/* Tenant / Shop */}
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[theme.typography.caption, { color: theme.colors.textPrimary, flex: 1 }]} numberOfLines={1}>
              <Text style={{ fontWeight: '600' }}>{item.tenant?.laundryName || 'Unnamed Shop'}</Text> {item.tenant?.tenantCode ? `(${item.tenant.tenantCode})` : ''}
            </Text>
          </View>

          {/* Branch */}
          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {item.branch?.name || 'N/A'}{item.branch?.city ? `, ${item.branch.city}` : ''}
            </Text>
          </View>

          {/* Customer */}
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {item.customer?.name || 'Customer'}{item.customer?.email ? ` (${item.customer.email})` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="wallet-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textTransform: 'capitalize' }]}>
              {item.paymentMethod || 'N/A'} · {item.paymentStatus || 'N/A'}
            </Text>
          </View>
          <Text style={[theme.typography.priceSmall, { color: theme.colors.primary }]}>
            {formatPrice(item.pricing?.total || 0)}
          </Text>
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header 
        title="Platform Orders" 
        showBack={navigation.canGoBack()} 
        onBack={() => navigation.goBack()} 
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <SearchBar
          placeholder="Search order no., customer, shop..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          resultCount={orders.length}
        />
      </View>
      
      <View>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={statusFilter === item.value}
              onPress={() => setStatusFilter(item.value)}
              style={{ marginRight: 8 }}
            />
          )}
        />
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} colors={[theme.colors.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={searchQuery || statusFilter ? "No Matching Orders" : "No Orders Found"}
            description={searchQuery || statusFilter ? "Try modifying your filters or search query" : "No orders have been placed on the platform yet."}
          />
        }
      />

      <SlideUpModal visible={modalVisible} onClose={() => setModalVisible(false)} height={600}>
        <View style={styles.modalContent}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 16 }]}>
            Order Details
          </Text>
          
          {detailLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : selectedOrder ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>
                  {selectedOrder.orderNumber}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <Badge status={selectedOrder.status} />
                </View>
              </View>

              <Divider spacing={16} />

              <Text style={[theme.typography.label, { color: theme.colors.primary, marginBottom: 8, fontWeight: '700' }]}>
                Customer Details
              </Text>
              <DetailRow label="Name" value={selectedOrder.customer?.name} />
              <DetailRow label="Email" value={selectedOrder.customer?.email} />

              <Divider spacing={16} />

              <Text style={[theme.typography.label, { color: theme.colors.primary, marginBottom: 8, fontWeight: '700' }]}>
                Shop Details
              </Text>
              <DetailRow label="Shop" value={selectedOrder.tenant?.laundryName} />
              <DetailRow label="Owner" value={selectedOrder.tenant?.owner?.name} />
              <DetailRow label="Branch" value={selectedOrder.branch?.name} />

              <Divider spacing={16} />

              <Text style={[theme.typography.label, { color: theme.colors.primary, marginBottom: 8, fontWeight: '700' }]}>
                Order Items
              </Text>
              {(selectedOrder.items || []).map((item: any, i: number) => (
                <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 8 } as any]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '500' }]}>
                      {item.item?.name || 'Item'}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                      {item.material?.name || 'Fabric'} · {item.service?.name || 'Service'}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>
                      {item.quantity} × {formatPrice(item.price)}
                    </Text>
                  </View>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600', alignSelf: 'center' }]}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}

              <Divider spacing={16} />

              <Text style={[theme.typography.label, { color: theme.colors.primary, marginBottom: 8, fontWeight: '700' }]}>
                Payment & Billing
              </Text>
              <DetailRow label="Payment Method" value={selectedOrder.paymentMethod} />
              <DetailRow label="Payment Status" value={selectedOrder.paymentStatus} />
              <DetailRow label="Subtotal" value={formatPrice(selectedOrder.pricing?.subtotal || 0)} />
              <DetailRow label="Discount" value={formatPrice(selectedOrder.pricing?.discount || 0)} />
              <DetailRow label="Total Amount" value={formatPrice(selectedOrder.pricing?.total || 0)} />
            </ScrollView>
          ) : (
            <EmptyState icon="receipt-outline" title="No details found" />
          )}
        </View>
      </SlideUpModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
  },
  filterList: { paddingHorizontal: 16, paddingVertical: 8 },
  modalContent: { flex: 1, padding: 20 },
  modalHeader: { marginBottom: 8 },
  detailRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 4 },
});
