import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
import orderReducer from './orderSlice';
import themeReducer from './themeSlice';
import uiReducer from './uiSlice';

const cartPersistenceMiddleware = store => next => action => {
  const result = next(action);
  if (['orders/addToCart', 'orders/removeFromCart', 'orders/clearCart', 'orders/setCart'].includes(action.type)) {
    const { cart } = store.getState().orders;
    AsyncStorage.setItem('@cart', JSON.stringify(cart)).catch(console.error);
  }
  return result;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(cartPersistenceMiddleware),
});

export default store;
