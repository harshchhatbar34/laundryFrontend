import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import { startLoading, stopLoading, showToast } from '../store/slices/uiSlice';

// Extend Axios configuration interface to support custom option hideLoader
declare module 'axios' {
  export interface AxiosRequestConfig {
    hideLoader?: boolean;
  }
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  hideLoader?: boolean;
}

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────
api.interceptors.request.use(
  async (config: CustomRequestConfig) => {
    console.log('[API REQ]', config.method?.toUpperCase(), config.url);
    // Attach bearer token if available
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dispatch loading state unless explicitly hidden
    if (!config.hideLoader) {
      store.dispatch(startLoading());
    }

    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

// ── Response Interceptor ─────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as CustomRequestConfig;
    console.log('[API RES SUCCESS]', config.method?.toUpperCase(), config.url, response.status);

    // Stop loading spinner
    if (!config.hideLoader) {
      store.dispatch(stopLoading());
    }

    // Show success toast for mutating requests
    const method = config.method?.toUpperCase();
    if (method && method !== 'GET') {
      const message = response.data?.message || 'Operation successful';
      store.dispatch(showToast({ type: 'success', message }));
    }

    return response;
  },
  async (error) => {
    const config = (error.config || {}) as CustomRequestConfig;
    console.warn(
      '[API RES ERROR]',
      config.method?.toUpperCase(),
      config.url,
      error.response?.status,
      JSON.stringify(error.response?.data || error.message)
    );

    // Stop loading spinner
    if (!config.hideLoader) {
      store.dispatch(stopLoading());
    }

    // Extract a user-friendly error message
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    store.dispatch(showToast({ type: 'error', message }));

    // Clear token and logout on 401 Unauthorized
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@token');
      try {
        const { logout } = require('../store/slices/authSlice');
        store.dispatch(logout() as any);
      } catch (e) {
        console.warn('Failed to dispatch logout on 401:', e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
