import api from './client';
import { AUTH_LOGIN, AUTH_REGISTER } from './endpoints';

export const login = async (email: string, password: string): Promise<any> => {
  try {
    const response = await api.post(AUTH_LOGIN, { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  tenantCode: string,
  mobileNumber?: string
): Promise<any> => {
  try {
    const response = await api.post(AUTH_REGISTER, {
      name,
      email,
      password,
      tenantCode,
      mobileNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
