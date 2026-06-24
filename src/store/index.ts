import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import themeReducer from './slices/themeSlice';
import notificationReducer from './slices/notificationSlice';

/**
 * Middleware that persists the cart to AsyncStorage whenever a cart-related action is dispatched.
 */
const CART_ACTIONS = [
  'orders/addToCart',
  'orders/removeFromCart',
  'orders/clearCart',
  'orders/setCart',
  'orders/updateCartQuantity',
];

const cartPersistenceMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  if (CART_ACTIONS.includes(action.type)) {
    const { cart } = store.getState().orders;
    AsyncStorage.setItem('@cart', JSON.stringify(cart)).catch((err) => {
      console.warn('Failed to persist cart to AsyncStorage:', err);
    });
  }

  return result;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    ui: uiReducer,
    theme: themeReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // AsyncStorage thunks pass non-serializable values
    }).concat(cartPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
