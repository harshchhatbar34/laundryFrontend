// FreshWash — Centralized API TypeScript Interfaces
// Single source of truth for all API response shapes across the app.

// ── Shared ────────────────────────────────────────────────────────────

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Auth ──────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'helper' | 'superadmin';
  mobileNumber?: string;
  tenantCode?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ── Branch ────────────────────────────────────────────────────────────

export interface Branch {
  _id: string;
  name: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode?: string;
  phone?: string;
  isLive: boolean;
  location: GeoPoint;
  owner?: string;
  tenantCode?: string;
  createdAt?: string;
}

// ── Service Catalog ───────────────────────────────────────────────────

export interface ServiceMaster {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Material {
  _id: string;
  name: string;
  serviceId: string;
}

export interface ServiceItem {
  _id: string;
  name: string;
  price: number;
  materialId?: string;
  serviceId?: string;
  unit?: string;
}

export interface ServiceCatalog {
  services: ServiceMaster[];
  materials: Material[];
  items: ServiceItem[];
}

// ── Cart & Orders ─────────────────────────────────────────────────────

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  serviceId?: string;
  materialId?: string;
  itemId?: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed_delivery';

export interface OrderAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  fullAddress?: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  itemId?: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  note?: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  finalAmount?: number;
  address?: string | OrderAddress;
  deliveryAddress?: string | OrderAddress;
  pickupSlot?: string;
  deliverySlot?: string;
  scheduledDate?: string;
  deliveryDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  couponCode?: string;
  discountAmount?: number;
  note?: string;
  rejectionNote?: string;
  customer?: User | string;
  helper?: User | string;
  branch?: Branch | string;
  timeline?: OrderTimelineEntry[];
  // Dedicated status timestamp fields matching backend columns
  pendingAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  pickupAt?: string;
  pickedUpAt?: string;
  processingAt?: string;
  readyAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  failedDeliveryAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Bill confirmation
  billConfirmed?: boolean;
  verifiedItems?: OrderItem[];
}

// ── Helper ────────────────────────────────────────────────────────────

export interface Helper {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  isActive: boolean;
  branch?: Branch | string;
  owner?: string;
  createdAt?: string;
}

// ── Owner ─────────────────────────────────────────────────────────────

export interface OwnerProfile {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  laundryName?: string;
  upiId?: string;
  city?: string;
  state?: string;
  tenantCode?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ── Stats ─────────────────────────────────────────────────────────────

export interface OwnerStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  avgRating?: number;
  totalReviews?: number;
}

export interface PlatformStats {
  totalOwners: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOwners?: number;
}

// ── Notification ──────────────────────────────────────────────────────

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type?: string;
  isRead: boolean;
  data?: Record<string, string>;
  userId?: string;
  createdAt: string;
}

// ── Rating ────────────────────────────────────────────────────────────

export interface Rating {
  _id: string;
  orderId: string;
  rating: number;
  review?: string;
  customer?: User | string;
  createdAt?: string;
}

// ── Coupon ────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
  tenantCode?: string;
  createdAt?: string;
}

// ── Address ───────────────────────────────────────────────────────────

export interface Address {
  _id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  isDefault?: boolean;
}
