import api from './client';
import { AUTH_LOGIN, AUTH_REGISTER } from './endpoints';

const authRequestConfig = {
  hideLoader: true,
  hideErrorToast: true,
};

export const login = async (email: string, password: string): Promise<any> => {
  const response = await api.post(AUTH_LOGIN, { email, password }, authRequestConfig);
  return response.data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  tenantCode: string,
  mobileNumber?: string
): Promise<any> => {
  const response = await api.post(
    AUTH_REGISTER,
    {
      name,
      email,
      password,
      tenantCode,
      mobileNumber,
    },
    authRequestConfig
  );
  return response.data;
};
