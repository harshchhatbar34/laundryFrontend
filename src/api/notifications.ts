import api from './client';
import { NOTIFICATIONS } from './endpoints';

export const getNotifications = async (params?: any): Promise<any> => {
  try {
    const response = await api.get(NOTIFICATIONS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAllRead = async (): Promise<any> => {
  try {
    const response = await api.patch(NOTIFICATIONS);
    return response.data;
  } catch (error) {
    throw error;
  }
};
