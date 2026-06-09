import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import store from '../store';
import { startLoading, stopLoading, showToast } from '../store/uiSlice';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (!config.hideLoader) {
      store.dispatch(startLoading());
    }
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (!error.config?.hideLoader) {
      store.dispatch(stopLoading());
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (!response.config.hideLoader) {
      store.dispatch(stopLoading());
    }
    if (response.config.method?.toLowerCase() !== 'get') {
      if (response.data && response.data.message) {
        store.dispatch(showToast({ message: response.data.message, type: 'success' }));
      }
    }
    return response;
  },
  async (error) => {
    if (!error.config?.hideLoader) {
      store.dispatch(stopLoading());
    }
    if (error.config?.method?.toLowerCase() !== 'get') {
      if (error.response?.data?.message) {
        store.dispatch(showToast({ message: error.response.data.message, type: 'error' }));
      } else {
        store.dispatch(showToast({ message: error.message || 'An error occurred', type: 'error' }));
      }
    }

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@token');
    }
    return Promise.reject(error);
  }
);

export default api;
