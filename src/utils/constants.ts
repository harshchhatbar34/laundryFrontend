// FreshWash — App Constants

export const APP_NAME = 'LaundroFlow';

export const TENANT_CODE = 'FHR6G6PY';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  HELPER: 'helper',
  OWNER: 'owner',
  SUPERADMIN: 'superadmin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  PROCESSING: 'processing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED_DELIVERY: 'failed_delivery',
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.ACCEPTED]: 'Accepted',
  [ORDER_STATUSES.PICKED_UP]: 'Picked Up',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.READY]: 'Ready',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
  [ORDER_STATUSES.FAILED_DELIVERY]: 'Failed Delivery',
} as const;

export const ORDER_STATUS_FLOW = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.ACCEPTED,
  ORDER_STATUSES.PICKED_UP,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.READY,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.COMPLETED,
] as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  UPI: 'upi',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash on Delivery',
  [PAYMENT_METHODS.UPI]: 'UPI Payment',
} as const;

export const PICKUP_SLOTS = [
  { label: '8am - 10am', value: '08:00-10:00' },
  { label: '10am - 12pm', value: '10:00-12:00' },
  { label: '12pm - 2pm', value: '12:00-14:00' },
  { label: '2pm - 4pm', value: '14:00-16:00' },
  { label: '4pm - 6pm', value: '16:00-18:00' },
  { label: '6pm - 8pm', value: '18:00-20:00' },
] as const;

export const SERVICE_ICONS: Record<string, string> = {
  'Dry Clean': '🧥',
  'Wash & Fold': '👕',
  'Steam Press': '♨️',
  'Iron Only': '🔥',
  'Stain Removal': '✨',
  'Shoe Cleaning': '👟',
  'Curtain Cleaning': '🪟',
  'Blanket Wash': '🛏️',
  default: '🧺',
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export type IndianState = typeof INDIAN_STATES[number];

