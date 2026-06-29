import api from './client';
import {
  ADMIN_OWNERS,
  ADMIN_TENANTS,
  ADMIN_COUPONS,
  ADMIN_STATS,
  ADMIN_CUSTOMERS,
  ADMIN_ORDERS,
  ADMIN_CUSTOMER_DETAIL,
  ADMIN_ORDER_DETAIL,
} from './endpoints';

// ── Owners ───────────────────────────────────────────────────────────

export const getOwners = async (): Promise<any> => {
  const response = await api.get(ADMIN_OWNERS);
  return response.data;
};

export const createOwner = async (data: any): Promise<any> => {
  const response = await api.post(ADMIN_OWNERS, data);
  return response.data;
};

export const toggleOwner = async (ownerId: string, isActive: boolean): Promise<any> => {
  const response = await api.patch(ADMIN_OWNERS, { ownerId, isActive });
  return response.data;
};

export const updateOwner = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`${ADMIN_OWNERS}/${id}`, data);
  return response.data;
};

export const getOwnerDetails = async (id: string): Promise<any> => {
  const response = await api.get(`${ADMIN_OWNERS}/${id}`);
  return response.data;
};

// ── Tenants ──────────────────────────────────────────────────────────

export const getTenants = async (params?: any): Promise<any> => {
  const response = await api.get(ADMIN_TENANTS, { params });
  return response.data;
};

// ── Coupons ──────────────────────────────────────────────────────────

export const getCoupons = async (): Promise<any> => {
  const response = await api.get(ADMIN_COUPONS);
  return response.data;
};

export const createCoupon = async (data: any): Promise<any> => {
  const response = await api.post(ADMIN_COUPONS, data);
  return response.data;
};

export const updateCoupon = async (id: string, data: any): Promise<any> => {
  const response = await api.patch(`${ADMIN_COUPONS}/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<any> => {
  const response = await api.delete(`${ADMIN_COUPONS}/${id}`);
  return response.data;
};

// ── Platform Stats ───────────────────────────────────────────────────

export const getPlatformStats = async (): Promise<any> => {
  const response = await api.get(ADMIN_STATS);
  return response.data;
};

export const getPlatformCustomers = async (params?: any): Promise<any> => {
  const response = await api.get(ADMIN_CUSTOMERS, { params });
  return response.data;
};

export const getPlatformOrders = async (params?: any): Promise<any> => {
  const response = await api.get(ADMIN_ORDERS, { params });
  return response.data;
};

export const getCustomerDetails = async (id: string): Promise<any> => {
  const response = await api.get(ADMIN_CUSTOMER_DETAIL(id));
  return response.data;
};

export const getPlatformOrderDetails = async (id: string): Promise<any> => {
  const response = await api.get(ADMIN_ORDER_DETAIL(id));
  return response.data;
};
