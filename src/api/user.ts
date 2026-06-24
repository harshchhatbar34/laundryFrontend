import api from './client';
import { USER_PROFILE, USER_ADDRESSES, USER_ADDRESS } from './endpoints';

// ── Profile ──────────────────────────────────────────────────────────

export const getProfile = async (): Promise<any> => {
  try {
    const response = await api.get(USER_PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: any): Promise<any> => {
  try {
    const response = await api.patch(USER_PROFILE, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Addresses ────────────────────────────────────────────────────────

export const getAddresses = async (): Promise<any> => {
  try {
    const response = await api.get(USER_ADDRESSES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAddress = async (data: any): Promise<any> => {
  try {
    const response = await api.post(USER_ADDRESSES, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (id: string): Promise<any> => {
  try {
    const response = await api.delete(USER_ADDRESS(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};
