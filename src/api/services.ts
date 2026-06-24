import api from './client';
import { MASTERS, SERVICES } from './endpoints';

export const getMasters = async (): Promise<any> => {
  try {
    const response = await api.get(MASTERS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServices = async (): Promise<any> => {
  try {
    const response = await api.get(SERVICES);
    return response.data;
  } catch (error) {
    throw error;
  }
};
