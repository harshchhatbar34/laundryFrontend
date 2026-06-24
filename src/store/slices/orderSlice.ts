import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadUser, logout } from './authSlice';

export interface CartItem {
  material: string;
  item: string;
  service: string;
  quantity: number;
  price: number;
  name: string;
  [key: string]: any;
}

export interface OrderState {
  cart: CartItem[];
  orders: any[];
  currentOrder: any | null;
  loading: boolean;
}

const initialState: OrderState = {
  cart: [],
  orders: [],
  currentOrder: null,
  loading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      state.cart.push(action.payload);
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.cart.splice(action.payload, 1);
    },
    updateCartQuantity(state, action: PayloadAction<{ index: number; quantity: number }>) {
      const { index, quantity } = action.payload;
      if (state.cart[index]) {
        state.cart[index].quantity = quantity;
      }
    },
    clearCart(state) {
      state.cart = [];
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.cart = action.payload;
    },
    setOrders(state, action: PayloadAction<any[]>) {
      state.orders = action.payload;
    },
    setCurrentOrder(state, action: PayloadAction<any>) {
      state.currentOrder = action.payload;
    },
    setOrdersLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload?.cart) {
          state.cart = action.payload.cart;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.cart = [];
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  setCart,
  setOrders,
  setCurrentOrder,
  setOrdersLoading,
} = orderSlice.actions;

export default orderSlice.reducer;

