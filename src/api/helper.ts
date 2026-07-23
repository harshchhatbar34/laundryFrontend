import api from './client';
import {
  HELPER_ORDERS,
  HELPER_ORDER_DETAIL,
  HELPER_BILL,
} from './endpoints';

export const getHelperOrders = async (params?: Record<string, any>, config?: any): Promise<any> => {
  try {
    const response = await api.get(HELPER_ORDERS, { params, ...config });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHelperOrderDetail = async (id: string): Promise<any> => {
  try {
    const response = await api.get(HELPER_ORDER_DETAIL(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptOrder = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(HELPER_ORDER_DETAIL(id), {
      action: 'accept',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  note?: string
): Promise<any> => {
  try {
    const body: Record<string, any> = { action: 'status', status };
    if (note) {
      body.note = note;
    }
    const response = await api.patch(HELPER_ORDER_DETAIL(id), body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const failDelivery = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(HELPER_ORDER_DETAIL(id), {
      action: 'fail_delivery',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBill = async (id: string, items: any[]): Promise<any> => {
  try {
    const response = await api.patch(HELPER_BILL(id), { items });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHelperStats = async (params?: Record<string, any>, config?: any): Promise<any> => {
  try {
    const response = await api.get('/helper/stats', { params, ...config });
    return response.data;
  } catch (error) {
    return { data: { totalOrders: 0, totalRevenue: 0, cashCollected: 0, upiCollected: 0 } };
  }
};
