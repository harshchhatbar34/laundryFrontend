import api from './client';
import {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_VERIFY_OTP,
  AUTH_RESEND_OTP,
  AUTH_FORGOT_PASSWORD,
  AUTH_RESET_PASSWORD,
  AUTH_SET_PASSWORD,
} from './endpoints';

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

export const verifyOtp = async (userId: string, otp: string): Promise<any> => {
  const response = await api.post(AUTH_VERIFY_OTP, { userId, otp }, authRequestConfig);
  return response.data;
};

export const resendOtp = async (userId: string): Promise<any> => {
  const response = await api.post(AUTH_RESEND_OTP, { userId }, authRequestConfig);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<any> => {
  const response = await api.post(AUTH_FORGOT_PASSWORD, { email }, authRequestConfig);
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<any> => {
  const response = await api.post(AUTH_RESET_PASSWORD, { token, password }, authRequestConfig);
  return response.data;
};

export const setPassword = async (token: string, password: string): Promise<any> => {
  const response = await api.post(AUTH_SET_PASSWORD, { token, password }, authRequestConfig);
  return response.data;
};
