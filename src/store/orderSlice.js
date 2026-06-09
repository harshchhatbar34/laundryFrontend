import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchOrders = createAsyncThunk('orders/fetch', async (arg = {}, { rejectWithValue }) => {
  const { hideLoader, ...params } = arg;
  try {
    const { data } = await api.get('/orders', { params, hideLoader });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (arg, { rejectWithValue }) => {
  const id = typeof arg === 'object' ? arg.id : arg;
  const hideLoader = typeof arg === 'object' ? arg.hideLoader : false;
  try {
    const { data } = await api.get(`/orders/${id}`, { hideLoader });
    return data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch order');
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place order');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`);
    return data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    pagination: null,
    loading: false,
    error: null,
    cart: [],
  },
  reducers: {
    clearOrderError: (state) => { state.error = null; },
    addToCart: (state, action) => {
      const item = action.payload;
      // Check if item already exists (same material, item, service)
      const existing = state.cart.find(
        (i) => i.material === item.material && i.item === item.item && i.service === item.service
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.cart.push(item);
      }
    },
    removeFromCart: (state, action) => {
      const { index } = action.payload;
      state.cart.splice(index, 1);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setCart: (state, action) => {
      state.cart = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrderById.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.currentOrder?._id === action.payload._id) state.currentOrder = action.payload;
      });
  },
});

export const { clearOrderError, addToCart, removeFromCart, clearCart, setCart } = orderSlice.actions;
export default orderSlice.reducer;
