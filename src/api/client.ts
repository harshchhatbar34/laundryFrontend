import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import { startLoading, stopLoading, showToast } from '../store/slices/uiSlice';

declare module 'axios' {
  export interface AxiosRequestConfig {
    hideLoader?: boolean;
    hideErrorToast?: boolean;
  }
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  hideLoader?: boolean;
  hideErrorToast?: boolean;
}

let sanitizedBaseURL = process.env.EXPO_PUBLIC_API_URL || '';
if (sanitizedBaseURL.endsWith('/')) {
  sanitizedBaseURL = sanitizedBaseURL.slice(0, -1);
}
if (sanitizedBaseURL.endsWith('/api')) {
  sanitizedBaseURL = sanitizedBaseURL.slice(0, -4);
}

const api = axios.create({
  baseURL: sanitizedBaseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: CustomRequestConfig) => {
    if (__DEV__) {
      console.log('[API REQ]', config.method?.toUpperCase(), config.url);
    }

    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as CustomRequestConfig;

    if (__DEV__) {
      console.log('[API RES SUCCESS]', config.method?.toUpperCase(), config.url, response.status);
    }

    if (!config.hideLoader) {
      store.dispatch(stopLoading());
    }

    const method = config.method?.toUpperCase();
    const message = response.data?.message;
    if (method && method !== 'GET' && message) {
      store.dispatch(showToast({ type: 'success', message }));
    }

    return response;
  },
  async (error) => {
    const config = (error.config || {}) as CustomRequestConfig;

    if (__DEV__) {
      console.warn(
        '[API RES ERROR]',
        config.method?.toUpperCase(),
        config.url,
        error.response?.status,
        JSON.stringify(error.response?.data || error.message)
      );
    }

    if (!config.hideLoader) {
      store.dispatch(stopLoading());
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (!config.hideErrorToast) {
      store.dispatch(showToast({ type: 'error', message }));
    }

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@token');
      try {
        const { logout } = await import('../store/slices/authSlice');
        store.dispatch(logout());
      } catch (e) {
        if (__DEV__) {
          console.warn('Failed to dispatch logout on 401:', e);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
