// FreshWash — Utility Helpers

import { ORDER_STATUSES, ORDER_STATUS_LABELS, OrderStatus } from './constants';

// Standard ECMAScript Intl formatters (cached for performance)
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const inrShortFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Format a number as currency (Indian Rupees) using standard ECMAScript Intl
 */
export const formatPrice = (amount: number | string | null | undefined): string => {
  if (amount == null || isNaN(Number(amount))) return '₹0.00';
  return inrFormatter.format(Number(amount));
};

/**
 * Format a number as short currency (no decimals) using standard ECMAScript Intl
 */
export const formatPriceShort = (amount: number | string | null | undefined): string => {
  if (amount == null || isNaN(Number(amount))) return '₹0';
  return inrShortFormatter.format(Number(amount));
};

/**
 * Format ISO date string to readable format
 */
export const formatDate = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format ISO date string to date + time
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time string using standard ECMAScript Intl.RelativeTimeFormat
 */
export const getRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

/**
 * Get status-specific color key from theme.colors
 */
export const getStatusColorKey = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    [ORDER_STATUSES.PENDING]: 'statusPending',
    [ORDER_STATUSES.ACCEPTED]: 'statusAccepted',
    [ORDER_STATUSES.PICKED_UP]: 'statusPickedUp',
    [ORDER_STATUSES.PROCESSING]: 'statusProcessing',
    [ORDER_STATUSES.READY]: 'statusReady',
    [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'statusOutForDelivery',
    [ORDER_STATUSES.DELIVERED]: 'statusDelivered',
    [ORDER_STATUSES.COMPLETED]: 'statusCompleted',
    [ORDER_STATUSES.CANCELLED]: 'statusCancelled',
    [ORDER_STATUSES.FAILED_DELIVERY]: 'statusFailed',
  };
  return map[status] || 'textSecondary';
};

/**
 * Get human-readable label for a status
 */
export const getStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status] || status;
};

/**
 * Get initials from a name (for avatar fallback)
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string | null | undefined, maxLength: number = 30): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate a greeting based on time of day
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate password strength (min 6 chars)
 */
export const isValidPassword = (password: string | null | undefined): boolean => {
  return !!(password && password.length >= 6);
};

/**
 * Validate strong password strength (min 8 chars, 1 upper, 1 lower, 1 digit, 1 special char)
 */
export const isStrongPassword = (password: string | null | undefined): boolean => {
  if (!password || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

interface CartItemInput {
  price: number;
  quantity: number;
}

/**
 * Calculate cart total from items array
 */
export const calculateCartTotal = (items: CartItemInput[] | null | undefined): number => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
export const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
