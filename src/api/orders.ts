import api from './client';
import { ORDERS, ORDER_DETAIL, ORDER_RESCHEDULE } from './endpoints';

export const getOrders = async (params?: Record<string, any>): Promise<any> => {
  try {
    const response = await api.get(ORDERS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (data: Record<string, any>): Promise<any> => {
  try {
    const response = await api.post(ORDERS, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetail = async (id: string): Promise<any> => {
  try {
    const response = await api.get(ORDER_DETAIL(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(ORDER_DETAIL(id), { action: 'cancel' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rescheduleDelivery = async (
  id: string,
  newDeliveryDate: string
): Promise<any> => {
  try {
    const response = await api.post(ORDER_RESCHEDULE(id), { newDeliveryDate });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmOrderBill = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(ORDER_DETAIL(id), { action: 'confirm_bill' });
    return response.data;
  } catch (error) {
    throw error;
  }
};
